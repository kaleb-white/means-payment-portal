"use client"

import Image from "next/image";

import { signInSubmit } from "@/lib/signin";
import { useActionState, useState } from "react";
import clsx from "clsx";

export default function Login() {
  const [state, action, pending] = useActionState(signInSubmit, null)

  // Output errors if fields are empty
  const [emailEmpty, setEmailEmpty] = useState(true)
  const [pwdEmpty, setPwdEmpty] = useState(true)

  return (
    <div className="flex flex-col place-content-center py-4 px-4 md:px-6">

      <Image src="/meanstv_logo.png" alt="Means TV" width={662} height={100} className="p-6 mx-auto"/>

      <div className="p-4 md:p-6 means-border rounded-sm md:rounded-lg w-full md:w-1/2 mx-auto">

        <div className="w-full flex flex-col mb-4">
          Sign in to the Payment Portal
        </div>

        <form action={action}>
          <div className="flex flex-col gap-6 w-full">

            <div className="w-full">
              <p className="text-sm mb-2">Email</p>
              <input
                onChange={e => {
                  if (e.target.value.length >= 1) setEmailEmpty(false)
                  else setEmailEmpty (true)
                }}
                className="means-border p-3 w-full" type="text" name="email"
                placeholder="currentlyseizing@means.tv"
              />
              <p className="text-means-red-error">{emailEmpty? state?.errors.email : null}</p>
            </div>

            <div>
              <p className="text-sm mb-2">Password</p>
              <input
                onChange={e => {
                  if (e.target.value.length >= 1) setPwdEmpty(false)
                  else setPwdEmpty (true)
                }}
                className="means-border p-3 w-full" type="password" name="password"
                placeholder="proletariandictator1234"
              />
              <p className="text-means-red-error">{pwdEmpty? state?.errors.password : null}</p>
            </div>

            <button className={clsx(' hover:bg-means-red-hover w-full font-bold text-xl p-2', {
              'bg-means-red': !pending,
              'bg-means-red-hover text-means-pending': pending
            })} type="submit">LOG IN</button>

          </div>
        </form>
      </div>
    </div>
  )
}
