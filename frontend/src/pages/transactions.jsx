import React, { useEffect, useState } from "react";
import { CiExport } from "react-icons/ci";
import { IoCheckmarkDoneCircle, IoSearchOutline } from "react-icons/io5";
import { MdAdd } from "react-icons/md";
import { RiProgress3Line } from "react-icons/ri";
import { TiWarning } from "react-icons/ti";
import { exportToExcel } from "react-json-to-excel";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import {
  AddTransaction,
  DateRange,
  Loading,
  Title,
  ViewTransaction,
} from "../componenets";
import { formatCurrency } from "../libs";
import api from "../libs/apiCall";

export const Transactions = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenView, setIsOpenView] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  const [search, setSearch] = useState("");
  const startDate = searchParams.get("df") || "";
  const endDate = searchParams.get("dt") || "";

  const handleViewTransaction = (el) => {
    setSelected(el);
    setIsOpenView(true);
  };

  const fetchTransactions = async () => {
    try {
      const URL = `/transaction?df=${startDate}&dt=${endDate}&s=${search}`;
      const { data: res } = await api.get(URL);

      setData(res?.data);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Something unexpected happened. Try again later."
      );
      if (error?.response?.data?.status === "auth_failed") {
        localStorage.removeItem("user");
        window.location.reload();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    setSearchParams({
      df: startDate,
      dt: endDate,
    });
    setIsLoading(true);
    await fetchTransactions();
  };

  useEffect(() => {
    setIsLoading(true);
    fetchTransactions();
  }, [startDate, endDate]);

  if (isLoading) return <Loading />;

  return (
    <>
      <div className="w-full py-10">
        <div className="flex flex-col justify-between mb-10 md:flex-row md:items-center">
          <Title title="Transactions Activity" />

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <DateRange />

            <form onSubmit={(e) => handleSearch(e)}>
              <div className="flex items-center w-full gap-2 px-2 py-2 border border-gray-300 rounded-md dark:border-gray-600">
                <IoSearchOutline className="text-xl text-gray-600 dark:text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                  placeholder="Search now..."
                  className="text-gray-700 bg-transparent outline-none group dark:text-gray-400 placeholder:text-gray-600"
                />
              </div>
            </form>

            <button
              onClick={() => setIsOpen(true)}
              className="py-1.5 px-2 rounded text-white bg-black dark:bg-violet-800 flex items-center justify-center gap-2 border border-gray-500"
            >
              <MdAdd size={22} />
              <span>Pay</span>
            </button>

            <button
              onClick={() =>
                exportToExcel(data, `Transactions ${startDate}-${endDate}`)
              }
              className="flex items-center gap-2 text-black dark:text-gray-300"
            >
              Export <CiExport size={24} />
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          {data?.length === 0 ? (
            <div className="flex items-center justify-center w-full py-10 text-lg text-gray-600 dark:text-gray-700">
              <span>No Transaction History</span>
            </div>
          ) : (
            <>
              <table className="w-full ">
                <thead className="w-full border-b border-gray-300 dark:border-gray-700">
                  <tr className="w-full text-left text-black dark:text-gray-400">
                    <th className="py-2">Date</th>
                    <th className="py-2">Description</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Source</th>
                    <th className="py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((item, index) => (
                    <tr
                      key={index}
                      className="text-sm text-gray-600 border-b border-gray-200 dark:border-gray-700 dark:text-gray-500 hover:bg-gray-300/10 md:text-base"
                    >
                      <td className="py-4">
                        {new Date(item.createdAt).toDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <p className="text-base text-black 2xl:text-lg dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {item.status === "Pending" && (
                            <RiProgress3Line
                              className="text-amber-600"
                              size={24}
                            />
                          )}
                          {item.status === "Completed" && (
                            <IoCheckmarkDoneCircle
                              className="text-emerald-600"
                              size={24}
                            />
                          )}
                          {item.status === "Rejected" && (
                            <TiWarning className="text-red-600" size={24} />
                          )}
                          <span>{item?.status}</span>
                        </div>
                      </td>
                      <td className="py-4">{item?.source}</td>
                      <td className="py-4 text-base font-medium text-black dark:text-gray-400">
                        <span
                          className={`${
                            item?.type === "income"
                              ? "text-emerald-600"
                              : "text-red-600"
                          } text-lg font-bold mgl-1`}
                        >
                          {item?.type === "income" ? "+" : "-"}
                        </span>
                        {formatCurrency(item?.amount)}
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => handleViewTransaction(item)}
                          className="outline-none text-violet-600 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      <AddTransaction
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        refetch={fetchTransactions}
        key={new Date().getTime()}
      />

      <ViewTransaction
        data={selected}
        isOpen={isOpenView}
        setIsOpen={setIsOpenView}
      />
    </>
  );
};
