"use client"

import Image from "next/image";

import { signInSubmit, signUpSubmit } from "@/lib/services/login";
import { useActionState, useEffect, useState } from "react";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import CustomError from "./_client_ui/error";

function Errors({fieldHasText, errors} : {fieldHasText: boolean | undefined, errors: string[] | undefined}){
  return (
    <>
      {!fieldHasText? (errors? errors.map((error, idx) => {
        return <p className="text-means-red-error text-sm" key={idx}>{error}</p>
      }) : null ): null}
    </>
  )
}

export default function Login() {
  const [signInState, signInAction, signInPending] = useActionState(signInSubmit, null)
  const [signUpState, signUpAction, signUpPending] = useActionState(signUpSubmit, null)

  // Track field contents
  const [currentPwd, setCurrentPwd] = useState("")
  const [currentEmail, setCurrentEmail] = useState("")

  // Check if password matches confirmed password
  const [confirmPwd, setConfirmPwd] = useState("")

  // Controller for sign in / sign up
  const [signIn, setSignIn] = useState(true)

  // Check for errors in search params, and decide on sign in / sign up display
  //    reference: https://nextjs.org/docs/app/api-reference/functions/use-search-params
  const searchParams = useSearchParams()
  useEffect(() => {if(searchParams.get("signUp") && Number(searchParams.get("signUp")) === 1) setSignIn(false)}, [])
  const error = searchParams.get("error")

  // Custom error messages for specific messages
  const extendedErrorMessage =
    error === 'fetch failed' ? " Check your internet connection. " : ""


  return (
    <div className="flex flex-col place-content-center py-4 px-4 md:px-6">

      <Image src="/meanstv_logo.png" alt="Means TV" width={662} height={100} className="p-6 mx-auto"/>

      <CustomError
        text={`Encountered an error: ${error?.endsWith('.')? error.slice(0, -1) : error}.${extendedErrorMessage} If the issue persists, please contact means. Please sign in again.`}
        hidden={!error}
      />

      <div className="p-4 md:p-6 means-border rounded-sm md:rounded-lg w-full md:w-1/2 mx-auto">

        {/* Sign up / log in control */}
        <div className="w-full flex flex-col mb-4 text-sm">
          <div className={clsx({'hidden': !signIn})}>
            <p className="inline-block mr-2">Sign in to the payment portal </p>
            <p onClick={_ => {setSignIn(false); setCurrentEmail(""); setCurrentPwd("");}} className="inline-block text-means-red cursor-pointer">No account? Sign up</p>
          </div>
          <div className={clsx({'hidden': signIn})}>
            <p className="inline-block mr-2">Sign up for the payment portal </p>
            <p onClick={_=> {setSignIn(true); setCurrentEmail(""); setCurrentPwd("");}} className="inline-block text-means-red cursor-pointer">Have an account? Sign in</p>
          </div>
        </div>

        {/* Sign in */}
        <form action={signInAction} className={clsx({'hidden': !signIn})}>
          <div className="flex flex-col gap-6 w-full">

            <div className="w-full">
              <p className="text-sm mb-2">Email</p>
              <input
                value={currentEmail}
                onChange={e => setCurrentEmail(e.target.value)}
                className="means-border p-3 w-full" type="text" name="email"
                placeholder="currentlyseizing@means.tv"
              />
              <Errors fieldHasText={currentEmail.length !== 0} errors={signInState?.email?.errors} />
            </div>

            <div>
              <p className="text-sm mb-2">Password</p>
              <input
                value={currentPwd}
                onChange={e => setCurrentPwd(e.target.value)}
                className="means-border p-3 w-full" type="password" name="password"
                placeholder="proletariandictator1234"
              />
              <Errors fieldHasText={currentPwd.length !== 0} errors={signInState?.password?.errors} />
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
                value={currentEmail}
                onChange={e => setCurrentEmail(e.target.value)}
                className="means-border p-3 w-full" type="text" name="email"
                placeholder="currentlyseizing@means.tv"
              />
              <Errors fieldHasText={currentEmail.length !== 0} errors={signUpState?.email?.errors} />
            </div>

            <div>
              <p className="text-sm mb-2">Password</p>
              <input
                value={currentPwd}
                onChange={e => setCurrentPwd(e.target.value)}
                className="means-border p-3 w-full" type="password" name="password"
                placeholder="proletariandictator1234"
              />
              <Errors fieldHasText={currentPwd.length !== 0} errors={signUpState?.password?.errors} />
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
              <p className="text-means-red-error text-sm">{confirmPwd !== currentPwd ? "Passwords do not match" : null}</p>
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
