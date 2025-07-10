"use client"

import Image from "next/image";

import { signInSubmit, signUpSubmit } from "@/lib/login";
import { useActionState, useState } from "react";
import clsx from "clsx";

export default function Login() {
  const [signInState, signInAction, signInPending] = useActionState(signInSubmit, null)
  const [signUpState, signUpAction, signUpPending] = useActionState(signUpSubmit, null)

  // Output errors if fields are empty
  const [emailEmpty, setEmailEmpty] = useState(true)
  const [pwdEmpty, setPwdEmpty] = useState(true)

  // Check if password matches confirmed password
  const [confirmPwd, setConfirmPwd] = useState("")
  const [currentPwd, setCurrentPwd] = useState("")

  // Controller for sign in / sign up
  const [signIn, setSignIn] = useState(true)

  return (
    <div className="flex flex-col place-content-center py-4 px-4 md:px-6">

      <Image src="/meanstv_logo.png" alt="Means TV" width={662} height={100} className="p-6 mx-auto"/>

      <div className="p-4 md:p-6 means-border rounded-sm md:rounded-lg w-full md:w-1/2 mx-auto">

        {/* Sign up / log in control */}
        <div className="w-full flex flex-col mb-4 text-sm">
          <div className={clsx({'hidden': !signIn})}>
            <p className="inline-block mr-2">Sign in to the payment portal </p>
            <p onClick={_ => {setSignIn(false); setEmailEmpty(false); setPwdEmpty(false);}} className="inline-block text-means-red cursor-pointer">No account? Sign up</p>
          </div>
          <div className={clsx({'hidden': signIn})}>
            <p className="inline-block mr-2">Sign up for the payment portal </p>
            <p onClick={_=> {setSignIn(true); setEmailEmpty(false); setPwdEmpty(false);}} className="inline-block text-means-red cursor-pointer">Have an account? Sign in</p>
          </div>
        </div>

        {/* Sign in */}
        <form action={signInAction} className={clsx({'hidden': !signIn})}>
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
              <p className="text-means-red-error">{emailEmpty? signInState?.errors.email : null}</p>
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
              <p className="text-means-red-error">{pwdEmpty? signInState?.errors.password : null}</p>
            </div>

            <button className={clsx(' hover:bg-means-red-hover w-full font-bold text-xl p-2', {
              'bg-means-red': !signInPending,
              'bg-means-red-hover text-means-pending': signInPending
            })} disabled={signInPending} type="submit">LOG IN</button>

          </div>
        </form>

        {/* Sign up */}
        <form action={signUpAction} className={clsx({'hidden': signIn})}>
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
              <p className="text-means-red-error">{emailEmpty? signUpState?.errors.email : null}</p>
            </div>

            <div>
              <p className="text-sm mb-2">Password</p>
              <input
                onChange={e => {
                  setCurrentPwd(e.target.value)
                  if (e.target.value.length >= 1) setPwdEmpty(false)
                  else setPwdEmpty (true)
                }}
                className="means-border p-3 w-full" type="password" name="password"
                placeholder="proletariandictator1234"
              />
              <p className="text-means-red-error">{pwdEmpty? signUpState?.errors.password : null}</p>
            </div>

            <div>
              <p className="text-sm mb-2">Confirm Password</p>
              <input
                onChange={e => {
                  setConfirmPwd(e.target.value)
                }}
                className="means-border p-3 w-full" type="password"
                placeholder="proletariandictator1234"
              />
              <p className="text-means-red-error">{confirmPwd !== currentPwd ? "Passwords do not match" : null}</p>
            </div>

            <button className={clsx(' hover:bg-means-red-hover w-full font-bold text-xl p-2', {
              'bg-means-red': !signUpPending,
              'bg-means-red-hover text-means-pending': signUpPending || confirmPwd !== currentPwd
            })} disabled={signUpPending || confirmPwd !== currentPwd} type="submit">SIGN UP</button>

          </div>
        </form>
      </div>
    </div>
  )
}
