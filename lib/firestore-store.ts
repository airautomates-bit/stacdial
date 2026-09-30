import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { defaults, type Product, type StoreSettings } from "./catalog";
import { firestore } from "./firebase-admin";

export type OrderRecord = Record<string, unknown> & {
  id:string;request_key:string;user_id:string|null;name:string;email:string;phone:string;
  contact_preference:string;alternative_phone:string;delivery_address:string;city:string;note:string;
  internal_notes:string;product_id:string;product_name:string;subtotal:number;discount:number;total:number;
  status:string;created:number;updated:number;synced:number;
};

const clean = <T>(value:T):T => JSON.parse(JSON.stringify(value)) as T;

export async function readFirestoreSettings():Promise<StoreSettings>{
  const snap=await firestore().collection("settings").doc("store").get();
  return {...defaults,...(snap.exists?snap.data():{})} as StoreSettings;
}
export async function writeFirestoreSettings(settings:StoreSettings){
  await firestore().collection("settings").doc("store").set(clean(settings));
}
export async function readFirestoreProducts(active=true):Promise<Product[]>{
  const ref=firestore().collection("products");
  const snap=active?await ref.where("active","==",true).get():await ref.get();
  return snap.docs.map(doc=>doc.data() as Product).sort((a,b)=>String(a.name).localeCompare(String(b.name)));
}
export async function readFirestoreProduct(id:string):Promise<Product|null>{
  const snap=await firestore().collection("products").doc(id).get();
  return snap.exists?snap.data() as Product:null;
}
export async function findFirestoreProduct(slug:string,active=true):Promise<Product|null>{
  const byId=await readFirestoreProduct(slug);
  if(byId&&(!active||byId.active))return byId;
  let query:FirebaseFirestore.Query=firestore().collection("products").where("slug","==",slug).limit(1);
  if(active)query=query.where("active","==",true);
  const snap=await query.get();
  return snap.empty?null:snap.docs[0].data() as Product;
}
export async function writeFirestoreProduct(product:Product){
  await firestore().collection("products").doc(product.id).set({...clean(product),updated:Date.now()}, {merge:false});
}
export async function deleteFirestoreProduct(id:string){
  const ref=firestore().collection("products").doc(id);const snap=await ref.get();if(!snap.exists)return false;await ref.delete();return true;
}
export async function listFirestoreOrders(limit=5000):Promise<OrderRecord[]>{
  const snap=await firestore().collection("orders").orderBy("created","desc").limit(limit).get();
  return snap.docs.map(doc=>doc.data() as OrderRecord);
}
export async function readFirestoreOrder(id:string):Promise<OrderRecord|null>{
  const snap=await firestore().collection("orders").doc(id).get();return snap.exists?snap.data() as OrderRecord:null;
}
export async function findOrderByRequestKey(requestKey:string):Promise<OrderRecord|null>{
  const snap=await firestore().collection("orders").where("request_key","==",requestKey).limit(1).get();return snap.empty?null:snap.docs[0].data() as OrderRecord;
}
export async function listUserOrders(uid:string):Promise<OrderRecord[]>{
  const snap=await firestore().collection("orders").where("user_id","==",uid).orderBy("created","desc").limit(100).get();return snap.docs.map(doc=>doc.data() as OrderRecord);
}
export async function createFirestoreOrder(order:OrderRecord){
  const orderRef=firestore().collection("orders").doc(order.id);
  const requestRef=firestore().collection("requestKeys").doc(order.request_key);
  await firestore().runTransaction(async transaction=>{if((await transaction.get(requestRef)).exists)throw new Error("DUPLICATE_REQUEST");transaction.create(requestRef,{orderId:order.id,created:order.created});transaction.create(orderRef,clean(order));});
}
export async function updateFirestoreOrder(id:string,data:Partial<OrderRecord>){
  const ref=firestore().collection("orders").doc(id);const snap=await ref.get();if(!snap.exists)return false;await ref.update({...clean(data),updated:Date.now()});return true;
}
export async function listCollection<T=Record<string,unknown>>(name:string,limit=1000,orderField?:string):Promise<T[]>{
  let query:FirebaseFirestore.Query=firestore().collection(name).limit(limit);if(orderField)query=query.orderBy(orderField,"desc");const snap=await query.get();return snap.docs.map(doc=>doc.data() as T);
}
export async function readCollectionDoc<T>(collection:string,id:string):Promise<T|null>{const snap=await firestore().collection(collection).doc(id).get();return snap.exists?snap.data() as T:null}
export async function writeCollectionDoc(collection:string,id:string,data:Record<string,unknown>,merge=false){await firestore().collection(collection).doc(id).set(clean(data),{merge})}
export async function deleteCollectionDoc(collection:string,id:string){await firestore().collection(collection).doc(id).delete()}
export async function logFirestore(actor:string,action:string){const id=crypto.randomUUID();await writeCollectionDoc("audit",id,{id,actor,action,created:Date.now()})}
export async function rateLimitFirestore(key:string,max:number){const ref=firestore().collection("rates").doc(key);const now=Date.now();return firestore().runTransaction(async transaction=>{const snap=await transaction.get(ref);const data=snap.data() as {count?:number;reset?:number}|undefined;const count=!data||Number(data.reset)<now?1:Number(data.count||0)+1;transaction.set(ref,{key,count,reset:!data||Number(data.reset)<now?now+3_600_000:data.reset});return count<=max})}
export async function markOrdersSynced(){const snap=await firestore().collection("orders").where("synced","==",0).limit(5000).get();const batch=firestore().batch();snap.docs.forEach(doc=>batch.update(doc.ref,{synced:1}));if(!snap.empty)await batch.commit()}
export {FieldValue};
