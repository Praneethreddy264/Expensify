import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Button from "../componenets/button";
import InputField from "../componenets/textfield";
import api from "../libs/apiCall";

export const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const submitHandler = async (data) => {
    try {
      setLoading(true);
      const { data: res } = await api.post("/auth/sign-up", data);

      if (res?.user) {
        toast.success(res?.message);

        setTimeout(() => {
          navigate("/sign-in");
        }, 1500);
      }
    } catch (error) {
      console.error("Something went wrong:", error);
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md px-8 pt-6 pb-8 bg-white rounded shadow-md dark:bg-black/30">
        <h2 className="mb-6 text-2xl font-semibold dark:text-white">Sign Up</h2>
        <form onSubmit={handleSubmit(submitHandler)}>
          <InputField
            type="email"
            name="email"
            label="Email Address"
            placeholder="example@codewave.com"
            register={register("email", {
              required: "Email Address is required!",
            })}
            error={errors.email ? errors.email.message : ""}
          />
          <InputField
            name="firstName"
            label="Name"
            placeholder="John Doe"
            register={register("firstName", {
              required: "Name is required!",
            })}
            error={errors.firstName ? errors.firstName.message : ""}
          />
          <InputField
            type="password"
            name="password"
            label="Password"
            placeholder="Password"
            register={register("password", {
              required: "Password is required!",
            })}
            error={errors.password ? errors.password.message : ""}
          />

          <div className="w-full mt-8">
            <Button
              loading={loading}
              type="submit"
              label="Create Account"
              className="w-full text-white bg-violet-800"
            />

            <p className="mt-4 text-sm text-center text-gray-600 dark:gray-500">
              Already has an account ?{" "}
              <Link to="/sign-in" className="text-violet-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
