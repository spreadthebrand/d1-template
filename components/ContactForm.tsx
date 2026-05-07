"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "@/lib/validation";
import type { z } from "zod";
type Values = z.infer<typeof contactSchema>;
export function ContactForm() { const [msg,setMsg]=useState<string>(); const { register, handleSubmit, formState:{errors,isSubmitting}, reset } = useForm<Values>({ resolver:zodResolver(contactSchema), defaultValues:{ source:"contact" } });
async function onSubmit(values: Values){ const res=await fetch("/api/contact",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(values)}); setMsg(res.ok?"Message received. We will follow up soon.":"Unable to send right now. Please try again."); if(res.ok) reset(); }
return <form onSubmit={handleSubmit(onSubmit)} className="card grid gap-5"><input {...register("hp")} className="hidden"/><label><span className="label">Name</span><input {...register("name")} className="input mt-2"/></label><label><span className="label">Email</span><input {...register("email")} className="input mt-2"/></label><label><span className="label">Reason for contact</span><input {...register("reason")} className="input mt-2"/></label><label><span className="label">Message</span><textarea {...register("message")} className="input mt-2 min-h-36"/></label>{Object.values(errors).length>0 && <p className="text-sm text-red-300">Please complete the required fields.</p>}<button disabled={isSubmitting} className="btn-primary">{isSubmitting?"Sending...":"Send Message"}</button>{msg && <p className="rounded-2xl bg-white/10 p-4 text-gold">{msg}</p>}</form> }
