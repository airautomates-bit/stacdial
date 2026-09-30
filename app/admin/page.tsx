import {admin} from "@/lib/server";
import {emailOnlyAdminAccess} from "@/lib/runtime";
import Dashboard from "./dashboard";
import AdminLogin from "./admin-login";
export const dynamic="force-dynamic";
export default async function Page(){const user=await admin();if(!user)return <AdminLogin emailOnly={emailOnlyAdminAccess()}/>;return <Dashboard authorized/>}
