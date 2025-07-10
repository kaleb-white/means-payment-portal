import Image from "next/image";
import Form from "next/form";

import { signIn } from "@/auth";

export default function Login() {
  async function signInSubmit(formData: FormData) {
    "use server"
    try {
      const email = formData.get("email"); const password = formData.get("password");
      await signIn("credentials", {email: email, password: password})
    } catch (error) {
      console.error("Sign in error:", error)
    }
  }

  return (
    <div className="flex flex-col place-content-center py-4 px-4 md:px-6">
      <Image src="/meanstv_logo.png" alt="Means TV" width={662} height={100} className="p-6 mx-auto"/>
      <div className="p-4 md:p-6 means-border rounded-sm md:rounded-lg w-full md:w-1/2 mx-auto">
        <div className="w-full flex flex-col mb-4">
          Sign in to the Payment Portal
        </div>
        <Form action={signInSubmit}>
          <div className="flex flex-col gap-6 w-full">
            <div className="w-full">
              <p className="text-sm mb-2">Email</p>
              <input className="means-border p-3 w-full" type="text" name="email" placeholder="currentlyseizing@means.tv" />
            </div>
            <div>
              <p className="text-sm mb-2">Password</p>
              <input className="means-border p-3 w-full" type="password" name="password" placeholder="proletariandictator1234" />
            </div>
            <button className="bg-means-red w-full font-bold text-xl p-2" type="submit">LOG IN</button>
          </div>
        </Form>
      </div>
    </div>
  )
}
