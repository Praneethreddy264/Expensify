import { Menu } from "@headlessui/react";
import { BiTransfer } from "react-icons/bi";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { MdMoreVert } from "react-icons/md";

import TransitionWrapper from "./wrappers/transition-wrapper";

export default function AccountMenu({ addMoney, transferMoney }) {
  return (
    <>
      <Menu as='div' className='relative inline-block text-left'>
        <Menu.Button className='inline-flex w-full justify-center rounded-md text-sm font-medium text-gray-600 dark:text-gray-300'>
          <MdMoreVert />
        </Menu.Button>

        <TransitionWrapper>
          <Menu.Items className='absolute p-2 right-0 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-slate-900 shadow-lg ring-1 ring-black/5 focus:outline-none'>
            <div className='px-1 py-1 space-y-2'>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={transferMoney}
                    className={`group flex gap-2 w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 dark:text-gray-500`}
                  >
                    <BiTransfer />
                    Transfer Funds
                  </button>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={addMoney}
                    className={`group flex gap-2 w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 dark:text-gray-500`}
                  >
                    <FaMoneyCheckDollar />
                    Add Money
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </TransitionWrapper>
      </Menu>
    </>
  );
}
