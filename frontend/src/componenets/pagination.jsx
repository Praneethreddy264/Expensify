import React, { useState } from "react";
import { MdOutlineArrowBack, MdOutlineArrowForward } from "react-icons/md";
import { useSearchParams } from "react-router-dom";

const Pagination = ({ numOfPages, pageNumber, total, length }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const df = searchParams.get("df");
  const dt = searchParams.get("dt");

  const [page, setPage] = useState(parseInt(searchParams.get("p")) || 1);

  const handlePagination = (type) => {
    let newPage;

    if (type === "next" && numOfPages > page) {
      newPage = page + 1;
    } else if (type === "prev" && page > 1) {
      newPage = page - 1;
    }

    setSearchParams({
      df: df,
      dt: dt,
      p: newPage,
    });

    setPage(newPage);
  };

  return (
    <div className='w-full flex items-center justify-between mt-6'>
      <button
        disabled={pageNumber === 1}
        onClick={() => handlePagination("prev")}
        className='flex items-center gap-2 outline-none text-black dark:text-gray-400 disabled:cursor-not-allowed'
      >
        <MdOutlineArrowBack />
        <span>Prev</span>
      </button>
      <p className='text-gray-600'>
        {length}/{total} records
      </p>
      <button
        disabled={numOfPages === page}
        onClick={() => handlePagination("next")}
        className='flex items-center gap-2 outline-none text-black dark:text-gray-400 disabled:cursor-not-allowed'
      >
        <span>Next</span>
        <MdOutlineArrowForward />
      </button>
    </div>
  );
};

export default Pagination;
