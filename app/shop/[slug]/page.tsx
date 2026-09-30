import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {admin} from "@/lib/server";
import {samples,type Product} from "@/lib/catalog";
import {firebaseServerConfigured} from "@/lib/firebase-admin";
import {findFirestoreProduct,readFirestoreProduct,readFirestoreProducts} from "@/lib/firestore-store";
import SiteHeader from "@/app/site-header";
import SiteFooter from "@/app/site-footer";
import ProductDetail from "./product-detail";
export const dynamic="force-dynamic";
async function findProduct(slug:string,preview?:string){if(!preview){const sample=samples.find(item=>(item.slug||item.id)===slug);if(sample)return sample}if(!firebaseServerConfigured())return null;const canPreview=preview&&await admin();return canPreview?readFirestoreProduct(preview):findFirestoreProduct(slug,true)}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const product=await findProduct(slug);if(!product)return {};return {title:product.seoTitle||`${product.name} | Stacdial`,description:product.seoDescription||product.description,openGraph:{images:product.socialImage||product.images[0]?[product.socialImage||product.images[0]]:[]}}}
export default async function Page({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{preview?:string}>}){const [{slug},{preview}]=await Promise.all([params,searchParams]);const product=await findProduct(slug,preview);if(!product)notFound();let related:Product[]=[];if(product.demo||!firebaseServerConfigured()){related=samples.filter(item=>item.id!==product.id).slice(0,4)}else{related=(await readFirestoreProducts(true)).filter(item=>item.id!==product.id&&(item.collection===product.collection||item.featured)).slice(0,4)}return <><SiteHeader products={[product,...related]} active="shop"/><ProductDetail product={product} related={related}/><SiteFooter/></>}
