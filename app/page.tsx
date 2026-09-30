import Storefront from './storefront';
import {storefrontData} from '@/lib/storefront-data';
export const dynamic="force-dynamic";
export default async function Page(){const data=await storefrontData();return <Storefront view="home" initialProducts={data.products} initialSettings={data.settings} initialClaimed={data.claimed} initialUnavailable={data.unavailable}/>}
