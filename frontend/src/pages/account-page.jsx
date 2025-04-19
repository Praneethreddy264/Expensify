import React, { useEffect, useState } from "react";
import { FaBtc, FaPaypal } from "react-icons/fa";
import { GiCash } from "react-icons/gi";
import { MdAdd, MdVerifiedUser } from "react-icons/md";
import { RiVisaLine } from "react-icons/ri";
import { toast } from "sonner";

import {
  AccountMenu,
  AddAccount,
  AddMoney,
  Loading,
  Title,
  TransferMoney,
} from "../componenets";
import { formatCurrency, maskAccountNumber } from "../libs";
import api from "../libs/apiCall";
import useStore from "../store";

const ICONS = {
  crypto: (
    <div className="flex items-center justify-center w-12 h-12 text-white rounded-full bg-amber-600">
      <FaBtc size={26} />
    </div>
  ),
  "visa debit card": (
    <div className="flex items-center justify-center w-12 h-12 text-white bg-blue-600 rounded-full">
      <RiVisaLine size={26} />
    </div>
  ),
  cash: (
    <div className="flex items-center justify-center w-12 h-12 text-white rounded-full bg-rose-600">
      <GiCash size={26} />
    </div>
  ),
  paypal: (
    <div className="flex items-center justify-center w-12 h-12 text-white bg-blue-700 rounded-full">
      <FaPaypal size={26} />
    </div>
  ),
};

export const AccountsPage = () => {
  const user = useStore((state) => state.user);

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenTopup, setIsOpenTopup] = useState(false);
  const [isOpenTransfer, setIsOpenTransfer] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenAddMoney = (el) => {
    setSelectedAccount(el?._id);
    setIsOpenTopup(true);
  };

  const handleTransferMoney = (el) => {
    setSelectedAccount(el?._id);
    setIsOpenTransfer(true);
  };

  const fetchAccounts = async () => {
    try {
      const { data: res } = await api.get(`/account`);

      setData(res?.data);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
      if (error?.response?.data?.status === "auth_failed") {
        localStorage.removeItem("user");
        window.location.reload();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchAccounts();
  }, []);

  if (isLoading) return <Loading />;

  return (
    <>
      <div className="w-full py-10">
        <div className="flex items-center justify-between">
          <Title title="Accounts Information" />
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="py-1.5 px-2 rounded bg-black dark:bg-violet-600 text-white dark:text-white flex items-center justify-center gap-2 border border-gray-500 "
            >
              <MdAdd size={22} />
              <span className="">Add</span>
            </button>
          </div>
        </div>

        {data?.length === 0 && (
          <div className="flex items-center justify-center w-full py-10 text-lg text-gray-600 dark:text-gray-700">
            <span>No Account Found</span>
          </div>
        )}

        {data?.length > 0 && (
          <div className="grid w-full gap-6 py-10 grid-col-1 md:grid-cols-3 2xl:grid-cols-4">
            {data?.map((acc, index) => (
              <div
                key={index}
                className="flex w-full h-48 gap-4 p-5 rounded shadow bg-gray-50 dark:bg-slate-800"
              >
                <div>{ICONS[acc?.account_name?.toLowerCase()]}</div>
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-2xl font-bold text-black dark:text-white">
                        {acc?.account_name}
                      </p>
                      <MdVerifiedUser
                        size={26}
                        className="ml-1 text-emerald-600"
                      />
                    </div>
                    <AccountMenu
                      addMoney={() => handleOpenAddMoney(acc)}
                      transferMoney={() => handleTransferMoney(acc)}
                    />
                  </div>
                  <span className="font-light leading-loose text-gray-600 dark:text-gray-400">
                    {maskAccountNumber(acc?.account_number)}
                  </span>

                  <p className="text-xs text-gray-600 dark:text-gray-500">
                    {new Date(acc?.createdAt).toLocaleDateString("en-US", {
                      dateStyle: "full",
                    })}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-xl font-medium text-gray-600 dark:text-gray-400">
                      {formatCurrency(
                        acc?.account_balance,
                        user?.country?.currency
                      )}
                    </p>
                    <button
                      onClick={() => handleOpenAddMoney(acc)}
                      className="text-sm outline-none text-violet-600 hover:underline"
                    >
                      Add Money
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddAccount
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        refetch={fetchAccounts}
        key={new Date().getTime()}
      />

      <AddMoney
        isOpen={isOpenTopup}
        setIsOpen={setIsOpenTopup}
        id={selectedAccount}
        refetch={fetchAccounts}
        key={new Date().getTime() + 1}
      />

      <TransferMoney
        isOpen={isOpenTransfer}
        setIsOpen={setIsOpenTransfer}
        id={selectedAccount}
        refetch={fetchAccounts}
        key={new Date().getTime() + 2}
      />
    </>
  );
};
