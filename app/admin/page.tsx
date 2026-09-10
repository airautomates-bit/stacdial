import {admin} from "@/lib/server";
import Dashboard from "./dashboard";
export const dynamic="force-dynamic";
export default async function Page(){const user=await admin();return <Dashboard authorized={!!user}/>}
