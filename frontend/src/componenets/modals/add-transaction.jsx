import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MdOutlineWarning } from "react-icons/md";
import { toast } from "sonner";

import Button from "../button";
import InputField from "../textfield";
import DialogWrapper from "../wrappers/dialog-wrapper";
import { formatCurrency } from "../../libs";
import api from "../../libs/apiCall";
import Loading from "../loading";
import useStore from "../../store";

const AddTransaction = ({ isOpen, setIsOpen, refetch }) => {
  const { user } = useStore((state) => state);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const [accountBalance, setAccountBalance] = useState(0);
  const [selectedAccountName, setSelectedAccountName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState([]);
  const [accountInfo, setAccountInfo] = useState({});

  const submitHandler = async (data) => {
    try {
      setLoading(true);
      const newData = { ...data, source: accountInfo.account_name };

      const { data: res } = await api.post(
        `/transaction/add-transaction/${accountInfo._id}`,
        newData
      );
      if (res?.status === "success") {
        toast.success(res?.message);
        setIsOpen(false);
        refetch();
      }
    } catch (error) {
      console.error("Something went wrong:", error);
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAccountBalance = (val) => {
    setSelectedAccountName(val); // Set selected account
    const filteredAccount = accountData?.find(
      (account) => account.account_name === val
    );
    setAccountBalance(filteredAccount ? filteredAccount.account_balance : 0);
    setAccountInfo(filteredAccount);
  };

  function closeModal() {
    setIsOpen(false);
  }

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const { data: res } = await api.get(`/account`);
      setAccountData(res?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <DialogWrapper isOpen={isOpen} closeModal={closeModal}>
      <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left align-middle shadow-xl transition-all">
        <Dialog.Title
          as="h3"
          className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300 mb-4 uppercase"
        >
          Add Transaction
        </Dialog.Title>

        {isLoading ? (
          <Loading />
        ) : (
          <form onSubmit={handleSubmit(submitHandler)}>
            <div className="flex flex-col gap-1 mb-2">
              <p className="text-gray-700 dark:text-gray-400 text-sm mb-2">
                Select Account
              </p>
              <select
                value={selectedAccountName}
                onChange={(e) => getAccountBalance(e.target.value)}
                className="inputStyles"
                required
              >
                <option value="" disabled>
                  Select Account
                </option>
                {accountData?.map((acc, index) => (
                  <option key={index} value={acc?.account_name}>
                    {acc?.account_name} {" - "}
                    {formatCurrency(
                      acc?.account_balance,
                      user?.country?.currency
                    )}
                  </option>
                ))}
              </select>
            </div>

            {accountBalance <= 0 && selectedAccountName && (
              <div className="flex items-center gap-2 bg-yellow-400 text-black p-2 mt-6 rounded">
                <MdOutlineWarning size={30} />
                <span className="text-sm">
                  You can not make transaction from this account. Insufficient
                  account balance.
                </span>
              </div>
            )}

            {accountBalance > 0 && (
              <>
                <InputField
                  name="description"
                  label="Description"
                  placeholder="Grocery Store"
                  register={register("description", {
                    required: "Transaction description is required!",
                  })}
                  error={errors.description ? errors.description.message : ""}
                />

                <InputField
                  type="number"
                  name="amount"
                  label="Amount"
                  placeholder="10.56"
                  register={register("amount", {
                    required: "Transaction amount is required!",
                  })}
                  error={errors.amount ? errors.amount.message : ""}
                />

                <div className="w-full mt-8">
                  <Button
                    loading={loading}
                    type="submit"
                    label={`Confirm ${
                      watch("amount")
                        ? formatCurrency(watch("amount"), user?.country?.currency)
                        : ""
                    }`}
                    className="bg-violet-700 text-white w-full"
                  />
                </div>
              </>
            )}
          </form>
        )}
      </Dialog.Panel>
    </DialogWrapper>
  );
};

export default AddTransaction;
