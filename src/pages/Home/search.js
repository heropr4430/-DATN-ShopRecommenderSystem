import HomeBG from '../../assets/HomeImg/home.jpg';
import MaxWidthWrapper from '../../components/MaxWidthWrapper/index';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { SearchContext } from '../../components/searchContext';
import { useNavigate } from 'react-router-dom';
import { fetchProduct, fetchTopViewProducts, fetchTop10Seller } from '../../services/HomeApi/home';
import useDebounce from '../../components/useDebounce/useDebounce';

const Search = () => {
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const debouncedInputValue = useDebounce(inputValue, 500); // Debounce input value
    const [seeMore, setSeeMore] = useState(true);
    const { setSearchQuery } = useContext(SearchContext);
    const navigate = useNavigate();

    const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = (e, searchKey) => {
        console.log('search key: ', searchKey);
        e.preventDefault();
        setSearchQuery(searchKey);
        localStorage.setItem('searchQuery', searchKey);
        navigate('/productpage');
        // lưu vào localstorage
        // Lấy dữ liệu từ Local Storage
        let recentSearch = JSON.parse(localStorage.getItem('recentSearch')) || [];

        // Kiểm tra recentSearch có phải là mảng không, nếu không thì khởi tạo là mảng rỗng
        if (!Array.isArray(recentSearch)) {
            recentSearch = [];
        }

        // Thêm searchKey mới vào mảng recentSearch (nếu chưa có)
        if (!recentSearch.includes(searchKey)) {
            recentSearch.push(searchKey);
        }

        // // Giới hạn số lượng phần tử tối đa trong mảng (ví dụ: giới hạn là 5)
        // const maxRecentSearches = 5;
        // if (recentSearch.length > maxRecentSearches) {
        //     recentSearch.splice(0, recentSearch.length - maxRecentSearches);
        // }

        // Cập nhật lại Local Storage với mảng recentSearch đã cập nhật
        localStorage.setItem('recentSearch', JSON.stringify(recentSearch));
    };
    // State for recent searches
    const [recentSearch, setRecentSearch] = useState([]);

    // Fetch recent searches from local storage on component mount
    useEffect(() => {
        const storedRecentSearch = JSON.parse(localStorage.getItem('recentSearch')) || [];
        setRecentSearch(storedRecentSearch);
    }, []);

    useEffect(() => {
        if (debouncedInputValue) {
            const fetchDataProduct = async () => {
                try {
                    const response = await fetchProduct({
                        searchKey: debouncedInputValue,
                    });
                    console.log('response suggestions search key: ', response);
                    setSuggestions(response);
                } catch (error) {
                    console.log(error);
                }
            };

            fetchDataProduct();
        } else {
            setSuggestions([]); // Clear suggestions when input is empty
        }
    }, [debouncedInputValue]);
    const handleClearRecentSearch = () => {
        // Clear recent searches from local storage and state
        localStorage.removeItem('recentSearch');
        setRecentSearch([]);
    };
    //
    const [topViewProducts, setTopViewProducts] = useState([]);
    const [topSeller, setTopSeller] = useState([]);
    const getTopSeller = useCallback(async () => {
        try {
            const response = await fetchTop10Seller();
            setTopSeller(response); // Gọi hàm setter với giá trị response
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    });

    const getTopViewProduct = useCallback(async () => {
        try {
            const response = await fetchTopViewProducts();
            setTopViewProducts(response); // Gọi hàm setter với giá trị response
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    });
    useEffect(() => {
        const fetchData = async () => {
            await getTopViewProduct();
            await getTopSeller();
        };
        fetchData();
    }, []);
    // Tạo mảng các placeholder từ dữ liệu topViewProducts
    const searchPlaceholders = topViewProducts?.map((product) => ({
        title: `${product.name}`,
    }));

    // Đảm bảo currentPlaceholder luôn hợp lệ
    const currentPlaceholder = searchPlaceholders.length > 0 ? searchPlaceholders[currentPlaceholderIndex]?.title : '';

    // Cập nhật placeholder định kỳ
    useEffect(() => {
        if (searchPlaceholders.length > 0) {
            const interval = setInterval(() => {
                setCurrentPlaceholderIndex((prevIndex) => (prevIndex + 1) % searchPlaceholders.length);
            }, 3000); // Thay đổi sau mỗi 3 giây

            return () => clearInterval(interval);
        }
    }, [searchPlaceholders]);
    return (
        <div className="relative w-full">
            <img
                data-twe-lazy-load-init
                data-twe-lazy-src
                className="hidden w-full h-full border-transparent bl md:block md:max-lg:object-cover md:max-lg:min-h-3/4 md:max-lg:h-imgBG"
                src={HomeBG}
                alt="This is home background"
            />
            <MaxWidthWrapper>
                <div className="absolute flex-row items-start w-3/6 h-1/2 start-20 top-1/3 z-2 lg:left-44 md:left-8">
                    <span className="font-bold text-white uppercase md:text-2xl lg:text-3xl">
                        Nền tảng thương mại điện tử B2C hàng đầu cho giao dịch toàn cầu
                    </span>
                    <form
                        className="relative w-full mx-auto md:my-8 lg:my-12"
                        onSubmit={(e) => handleSubmit(e, inputValue)}
                    >
                        <label
                            htmlFor="default-search"
                            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                        >
                            Tìm kiếm
                        </label>
                        <div className="relative group">
                            <input
                                type="search"
                                id="default-search"
                                className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg ps-10 bg-gray-50 focus:ring-primary/50 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder={currentPlaceholder}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                onChange={handleChange}
                            />
                            <button
                                type="submit"
                                className="text-white flex gap-2 items-center absolute end-2.5 bottom-1 bg-primary hover:bg-primary/75 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-3 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="w-4 h-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                    />
                                </svg>
                                <span>Tìm kiếm</span>
                            </button>
                        </div>

                        <div
                            id="searchexpand"
                            className={`  ${
                                isFocused ? 'block' : 'hidden'
                            } absolute left-0 z-20  w-full h-auto bg-white border-gray-300 rounded-lg top-14 lg:py-2 `}
                        >
                            {inputValue.length === 0 ? (
                                <>
                                    <div class=" w-full text-sm text-gray-900 lg:pr-4">
                                        {recentSearch.length !== 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold lg:ml-10 lg:text-lg">
                                                    Tìm kiếm gần đây
                                                </span>
                                                <button
                                                    onClick={handleClearRecentSearch}
                                                    className="text-xs font-light text-red-600 underline cursor-pointer"
                                                >
                                                    Xoá
                                                </button>
                                            </div>
                                        )}
                                        {recentSearch
                                            .slice(0, seeMore ? recentSearch.length : 4)
                                            .map((search, index) => (
                                                <div
                                                    onSubmit={(e) => handleSubmit(e, search)}
                                                    className="flex items-center cursor-pointer hover:bg-gray-200/55 lg:leading-10 lg:gap-4"
                                                    key={index}
                                                >
                                                    <div className="flex items-center justify-center w-6 h-6 rounded-full lg:ml-10 bg-gray-300/80">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth="1.5"
                                                            stroke="currentColor"
                                                            className="w-4 h-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <span className="font-light">{search}</span>
                                                </div>
                                            ))}

                                        {recentSearch.length >= 5 && (
                                            <button
                                                onClick={() => setSeeMore(!seeMore)}
                                                className="flex items-center justify-center w-full gap-2 mx-auto text-xs underline lg:leading-10 hover:bg-background"
                                            >
                                                {seeMore ? (
                                                    <>
                                                        <span>Hiển thị thêm </span>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth="1.5"
                                                            stroke="currentColor"
                                                            className="w-4 h-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                                            />
                                                        </svg>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Rút gọn </span>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth="1.5"
                                                            stroke="currentColor"
                                                            className="w-4 h-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                                            />
                                                        </svg>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <div class=" w-full  text-sm text-gray-900  ">
                                        <span className="font-semibold lg:ml-10 lg:text-base">Đề xuất cho bạn</span>
                                        {topViewProducts.slice(0, 3).map((product) => (
                                            <div
                                                className="flex items-center cursor-pointer hover:bg-gray-200/55 lg:leading-10 lg:gap-4"
                                                key={product.iD_NK}
                                            >
                                                <div className="flex items-center justify-center w-6 h-6 lg:ml-10 ">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke-width="1.5"
                                                        stroke="currentColor"
                                                        class="size-5 text-red-300"
                                                    >
                                                        <path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
                                                        />
                                                        <path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="font-light ">{product.name}</span>
                                                <span className="ml-auto text-xs font-light text-gray-400 lg:mr-10">
                                                    sản phẩm
                                                </span>
                                            </div>
                                        ))}
                                        {topSeller.slice(0, 3).map((seller) => (
                                            <div
                                                className="flex items-center cursor-pointer hover:bg-gray-200/55 lg:leading-10 lg:gap-4"
                                                key={seller.iD_NK}
                                            >
                                                <div className="flex items-center justify-center w-6 h-6 lg:ml-10 ">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke-width="1.5"
                                                        stroke="currentColor"
                                                        class="size-5 text-red-300"
                                                    >
                                                        <path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
                                                        />
                                                        <path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="font-light ">{seller.name}</span>
                                                <span className="ml-auto text-xs font-light text-gray-400 lg:mr-10">
                                                    sửa hàng
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {suggestions.length > 0 ? (
                                        <div class=" w-full text-sm text-gray-900 ">
                                            {suggestions.map((suggestion) => (
                                                <div
                                                    onSubmit={(e) => handleSubmit(e, suggestion.name)}
                                                    className="flex items-center cursor-pointer hover:bg-gray-200/55 lg:leading-10 lg:gap-4"
                                                    key={suggestion.iD_NK}
                                                >
                                                    <div className="w-[10px]  lg:ml-10 ">
                                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-300/80">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth="1.5"
                                                                stroke="currentColor"
                                                                className="w-4 h-4"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <p className="w-11/12 overflow-hidden font-light lg:pl-4 text-nowrap">
                                                        {suggestion.name}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 p-4 text-gray-500">
                                            <span>Không tìm thấy sản phẩm phù hợp</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </form>
                    <div className="flex items-center justify-between">
                        <span className="w-1/4 text-white">Tìm kiếm thường xuyên: </span>
                        <div className="flex w-3/4 lg:gap-2">
                            {topViewProducts.slice(0, 3).map((product) => (
                                <a
                                    href={`/productdetail/${product.iD_NK}`}
                                    className="py-2 overflow-hidden font-normal text-white truncate bg-transparent border border-white text-nowrap max-w-1/3 lg:px-2 lg:text-xs rounded-3xl hover:bg-primary/50 hover:text-white hover:border-transparent"
                                >
                                    {product.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </MaxWidthWrapper>
        </div>
    );
};

export default Search;
