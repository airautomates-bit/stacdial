"use client";
import {Crop,defaultCrop} from "@/lib/catalog";
export function FramedImage({src,mobileSrc,alt,crop=defaultCrop,mobileCrop=crop,className=""}:{src:string;mobileSrc?:string;alt:string;crop?:Crop;mobileCrop?:Crop;className?:string}){
return <div className={"framed-image "+className} style={{"--crop-x":crop.x+"%","--crop-y":crop.y+"%","--crop-zoom":crop.zoom,"--crop-fit":crop.fit,"--mobile-x":mobileCrop.x+"%","--mobile-y":mobileCrop.y+"%","--mobile-zoom":mobileCrop.zoom,"--mobile-fit":mobileCrop.fit} as React.CSSProperties}>{mobileSrc?<picture><source media="(max-width: 900px)" srcSet={mobileSrc}/><img src={src} alt={alt}/></picture>:<img src={src} alt={alt}/>}</div>
}
