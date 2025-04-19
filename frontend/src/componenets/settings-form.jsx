import { Combobox, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BsChevronExpand } from "react-icons/bs";
import { toast } from "sonner";

import useStore from "../store";
import { fetchCountries } from "../libs";
import api from "../libs/apiCall";
import Button from "./button";
import InputField from "./textfield";
import { BiCheck } from "react-icons/bi";

const SettingsForm = () => {
  const { user, theme, setTheme } = useStore((state) => state);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { ...user },
  });
  const [selectedCountry, setSelectedCountry] = useState(user?.country || "");
  const [query, setQuery] = useState("");
  const [countriesData, setCountriesData] = useState([]);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (data) => {
    try {
      setLoading(true);
      const newData = {
        ...data,
        countryName: selectedCountry.name,
        currency: selectedCountry.currencies.code,
        flag: selectedCountry.flag,
      };
      const { data: res } = await api.put(`/user/${user?._id}`, newData);

      if (res?.user) {
        const newUser = { ...res.user, token: user.token };
        localStorage.setItem("user", JSON.stringify(newUser));

        toast.success(res?.message);
      }
    } catch (error) {
      console.error("Something went wrong:", error);
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = (val) => {
    setTheme(val);
    localStorage.setItem("theme", val);
  };

  const filteredCountries =
    query === ""
      ? countriesData
      : countriesData.filter((country) =>
          country.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  const getCountriesList = async () => {
    const data = await fetchCountries();
    setCountriesData(data);
  };

  useEffect(() => {
    getCountriesList();
  }, []);

  const Countries = () => {
    return (
      <div className='w-full'>
        <Combobox value={selectedCountry} onChange={setSelectedCountry}>
          <div className='relative mt-1'>
            <div className=''>
              <Combobox.Input
                className='inputStyles'
                displayValue={(country) => country.name}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Combobox.Button className='absolute inset-y-0 right-0 flex items-center pr-2'>
                <BsChevronExpand className='text-gray-400' />
              </Combobox.Button>
            </div>
            <Transition
              as={Fragment}
              leave='transition ease-in duration-100'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
              afterLeave={() => setQuery("")}
            >
              <Combobox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-900 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm'>
                {filteredCountries.length === 0 && query !== "" ? (
                  <div className='relative cursor-default select-none px-4 py-2 text-gray-700 dark:text-gray-500'>
                    Nothing found.
                  </div>
                ) : (
                  filteredCountries?.map((country, index) => (
                    <Combobox.Option
                      key={country.name + index}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active
                            ? "bg-violet-600/20 text-white"
                            : "text-gray-900"
                        }`
                      }
                      value={country}
                    >
                      {({ selected, active }) => (
                        <>
                          <div className='flex items-center gap-2'>
                            <img
                              src={country?.flag}
                              alt={country.name}
                              className='w-8 h-5 rounded-sm object-cover'
                            />
                            <span
                              className={`block truncate text-gray-700 dark:text-gray-500 ${
                                selected ? "font-medium" : "font-normal"
                              }`}
                            >
                              {country?.name}
                            </span>
                          </div>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? "text-white" : "text-teal-600"
                              }`}
                            >
                              <BiCheck className='h-5 w-5' aria-hidden='true' />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className='space-y-5'>
      <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
        <InputField
          name='firstName'
          label='First Name'
          placeholder='Doe'
          register={register("firstName", {
            required: "First Name is required!",
          })}
          error={errors.firstName ? errors.firstName.message : ""}
        />
        <InputField
          name='lastName'
          label='Last Name'
          placeholder='John'
          register={register("lastName", {
            required: "Last Name is required!",
          })}
          error={errors.lastName ? errors.lastName.message : ""}
        />
      </div>

      <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
        <InputField
          type='email'
          name='email'
          label='Email Address'
          readOnly={true}
          placeholder='John@example.com'
          register={register("email", {
            required: "Email Address is required!",
          })}
          error={errors.email ? errors.email.message : ""}
        />
        <InputField
          type='tel'
          name='contact'
          label='Phone Number'
          placeholder='8726762783'
          register={register("contact", {
            required: "Phone Number is required!",
          })}
          error={errors.contact ? errors.contact.message : ""}
        />
      </div>

      <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
        <div className='w-full'>
          <span className='labelStyles'>Country</span>
          <Countries />
        </div>

        <div className='w-full'>
          <span className='labelStyles'>Currency</span>
          <select className='inputStyles'>
            <option>
              {selectedCountry?.currencies?.code || user?.country?.currency}
            </option>
          </select>
        </div>
      </div>

      <div className='w-full flex items-center justify-between pt-10'>
        <div className=''>
          <p className='text-lg text-black dark:text-gray-400 font-semibold'>
            Appearance
          </p>
          <span className='labelStyles'>
            Customize how your theme looks on your device.
          </span>
        </div>

        <div className='w-28 md:w-40'>
          <select
            className='inputStyles'
            defaultValue={theme}
            onChange={(e) => toggleTheme(e.target.value)}
          >
            <option value='light'>Light</option>
            <option value='dark'>Dark</option>
          </select>
        </div>
      </div>

      <div className='w-full flex items-center justify-between pb-10'>
        <div>
          <p className='text-lg text-black dark:text-gray-400 font-semibold'>
            Language
          </p>
          <span className='labelStyles'>
            Customize what language you want to use.
          </span>
        </div>

        <div className='w-28 md:w-40'>
          <select className='inputStyles'>
            <option value='English'>English</option>
          </select>
        </div>
      </div>

      <div className='flex items-center gap-6 justify-end pb-10 border-b-2 border-gray-200 dark:border-gray-800'>
        <Button
          type='reset'
          label='Reset'
          className='px-6 bg-transparent text-black dark:text-white border border-gray-200 dark:border-gray-700'
        />
        <Button
          loading={loading}
          type='submit'
          label='Save'
          className='px-8 bg-violet-800 text-white '
        />
      </div>
    </form>
  );
};

export default SettingsForm;
