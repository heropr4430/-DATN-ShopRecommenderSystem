import React, { useState, useCallback, useEffect } from "react";

import renderStars from "./RenderStars";
import axios from "../../services/axios-customize";
import { useNavigate, useParams } from "react-router-dom";
import CommentRating from "./CommentRating";
import CommentDetail from "./CommentDetail";
import Default_Avatar from "../../assets/default-avatar.png";
import { Modal } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addCartApi } from "../../services/CartApi/cartApi";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import ProductCard from "../../components/card/ProductCard";

const calculateTimeDifference = (date) => {
  const createdDate = new Date(date);
  const currentDate = new Date();

  let yearsDifference = currentDate.getFullYear() - createdDate.getFullYear();
  let monthsDifference = currentDate.getMonth() - createdDate.getMonth();

  if (monthsDifference < 0) {
    yearsDifference -= 1;
    monthsDifference += 12;
  }

  return { years: yearsDifference, months: monthsDifference };
};

const ProductDetailPage = () => {
  const navigate = useNavigate();

  // const { years, months } = calculateTimeDifference(Seller.createdAt);

  const id = parseInt(useParams().id);
  const token = localStorage.getItem("token");
  const [productDetail, setProduct] = useState({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [price, setPrice] = useState(0);

  const [option, setOption] = useState([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [idProductOptionValue, setIdProductOptionValue] = useState(0);
  const [productOptionImage, setProductOptionImage] = useState(0);

  const [option1, setOption1] = useState(0);
  const [selectedOption1Index, setSelectedOption1Index] = useState(0);
  const [idProductOption1Value, setIdProductOption1Value] = useState(0);
  const [productOption1Image, setProductOption1Image] = useState(0);

  const [option2, setOption2] = useState(0);
  const [selectedOption2Index, setSelectedOption2Index] = useState(0);
  const [idProductOption2Value, setIdProductOption2Value] = useState(0);
  const [productOption2Image, setProductOption2Image] = useState(0);

  const [quantity, setQuantity] = useState(1);

  const [comments, setComments] = useState([]);
  const [commentRating, setCommentRating] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [recommendProduct, setRecommendProduct] = useState([]);
  const [otherShopProduct, setOtherShopProduct] = useState([]);

  const [productOptionValues, setProductOptionValues] = useState([]);
  const [sellerID, setSellerId] = useState();

  const [hiddenDescription, setHiddenDescription] = useState(true);

  const fetchProductDetail = useCallback(async () => {
    try {
      const response = await axios.get(`/Products/${id}`);
      setProduct(response);
      fetchOtherShopProduct(response.seller?.iD_NK);
      fetchRecommendProducts(
        response.product?.iD_NK,
        response.product?.category_LV0_NK
      );
      fetchPrice();
    } catch (error) {
      console.error("Failed to fetch product detail:", error);
    }
  }, [id]);

  const fetchProductOption = useCallback(async () => {
    try {
      const response = await axios.get(`/Products/Option/${id}`);
      setOption(response?.[0].option);
      setProductOptionValues(response?.[0].productOptionValues);

      setOption1(response?.[0]);
      if (response.length === 2) setOption2(response?.[1]);
    } catch (error) {
      console.error("Failed to fetch product option:", error);
    }
  }, [id]);

  const fetchCommentRating = useCallback(async () => {
    try {
      const response = await axios.get(
        `/DetailComments/RattingCount/Product${id}`
      );
      setCommentRating(response);
    } catch (error) {
      console.error("Failed to fetch detail comment rating:", error);
    }
  }, [id]);

  const fetchPrice = useCallback(async () => {
    try {
      setPrice(productDetail?.product?.price);
    } catch (error) {
      console.error("Failed to fetch price:", error);
    }
  }, [fetchProductDetail]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(`/DetailComments/List${id}`, {
        params: {
          // PageNumber:
          PageSize: 5,
        },
      });
      setComments(response);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  }, []);

  const fetchAddToCart = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/CartItems/AddToCart`,
        {
          idProduct: id,
          idProductOptionValue: idProductOptionValue,
          ProductOptionImage: productOptionImage,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setComments(response.data[0]);
    } catch (error) {
      console.error("Failed to fetch add to cart:", error);
    }
  }, [idProductOptionValue, productOptionImage]);

  const fetchOtherShopProduct = useCallback(async (id) => {
    try {
      const response = await axios.get(`/Sellers/Products/${id}`);
      setOtherShopProduct(response.products);
    } catch (error) {
      console.error("Failed to fetch OtherShopProduct:", error);
    }
  }, []);

  const fetchRecommendProducts = useCallback(async (productId, cateId) => {
    try {
      const response = await axios.post(`/Products/RecommendProduct`, {
        productId: productId,
        cateId: cateId,
      });
      response.forEach((element) => {
        const temp = element.image;
        element.image = temp.substring(15, temp.indexOf("'", 15));
      });
      setRecommendProduct(response);
    } catch (error) {
      console.error("Failed to fetch RecommendProducts:", error);
    }
  }, []);

  useEffect(() => {
    fetchProductDetail();
    fetchPrice();
    fetchComments();
    fetchCommentRating();
    fetchProductOption();
  }, []);

  const handleDecrement = () => {
    setQuantity((prevQuantity) => Math.max(prevQuantity - 1, 1));
  };

  const handleIncrement = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else {
      setQuantity(value);
    }
  };

  const handleHiddenDescription = () => {
    setHiddenDescription(!hiddenDescription);
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const formatNumber = (number) => {
    return new Intl.NumberFormat().format(number);
  };

  let totalPrice = price * quantity;
  if (!totalPrice) totalPrice = productDetail?.product?.price * quantity;

  const handleBuyNow = (event) => {
    event.preventDefault();
    if (!token) {
      navigate("/login");
    } else {
      const selectedProduct =
        productDetail.productChildren[selectedOptionIndex];
      let matchingOptionValueId = null;

      productOptions.forEach((option) => {
        const match = option.productOptionValues.find(
          (optionValue) => optionValue.name === selectedProduct.option1
        );
        if (match) {
          matchingOptionValueId = match.id;
        }
      });

      const productWithQuantity = {
        product: productDetail.product,
        quantity: quantity,
        productImgs: selectedProduct
          ? selectedProduct.thumbnail_url
          : productDetail.images[0].image,
        optionValues: selectedProduct
          ? {
              id: matchingOptionValueId,
              name: selectedProduct.option1,
              option: null,
            }
          : undefined,
      };
      navigate("/checkout", {
        state: { selectedItems: [productWithQuantity] },
      });
    }
  };

  const handleAddCart = async (event) => {
    event.preventDefault();

    if (!token) {
      navigate("/login");
    } else {
      const selectedProduct =
        productDetail.productChildren[selectedOptionIndex];
      let matchingOptionValueId = null;

      productOptions.forEach((option) => {
        const match = option.productOptionValues.find(
          (optionValue) => optionValue.name === selectedProduct.option1
        );
        if (match) {
          matchingOptionValueId = match.id;
        }
      });
      try {
        const response = await addCartApi(
          productDetail.product.iD_NK,
          selectedProduct ? matchingOptionValueId : undefined,
          selectedProduct
            ? selectedProduct.thumbnail_url
            : productDetail.images[0].image,
          quantity,
          token
        );
        if (response.status === "201") {
          toast.success("Đã thêm vào giỏ hàng");
        } else {
          toast.error("Thêm vào giỏ hàng thất bại!");
        }
      } catch (error) {
        console.log("Failed to add to cart: ", error);
      }
    }
  };

  return (
    <div class="lg:pt-36 m-auto bg-background flex flex-col justify-center items-center pt-12">
      <div class="w-4/5 p-8 bg-white mt-4">
        <div class="w-full mx-4 grid items-start grid-cols-1 lg:grid-cols-9 gap-12">
          <div class="lg:col-span-3">
            <div className="flex flex-col-reverse">
              {/* Image selector */}
              <div className="overflow-hidden w-full max-w-2xl max-h-40 mx-auto mt-6 sm:block lg:max-w-none off">
                <div className="grid grid-cols-4 gap-6 m-1">
                  {productDetail?.images?.map((image, index) => (
                    <button
                      key={image.id}
                      className="relative flex items-center justify-center h-16 text-sm font-medium text-gray-900 uppercase bg-white rounded-md cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <span className="sr-only">{image.name}</span>
                      <span className="absolute inset-0 overflow-hidden rounded-md">
                        <img
                          src={image.image}
                          alt={image.id}
                          className="object-cover object-center w-full h-full"
                        />
                      </span>
                      <span
                        className={classNames(
                          selectedImageIndex === index
                            ? "ring-indigo-500"
                            : "ring-transparent",
                          "absolute inset-0 rounded-md ring-2 pointer-events-none"
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Display selected image */}
              <div className="w-full aspect-w-1 aspect-h-1">
                <img
                  src={productDetail?.images?.[selectedImageIndex].image}
                  alt={productDetail?.images?.[selectedImageIndex].id}
                  className="object-cover object-center w-full h-full sm:rounded-lg"
                />
              </div>
            </div>
          </div>

          <div class="lg:col-span-6 mx-8">
            <h2 class="text-2xl font-semibold text-gray-700">
              {productDetail?.product?.name}
            </h2>
            <div class="flex flex-wrap gap-4 mt-4">
              <p class="text-gray-700 text-4xl font-semibold">
                {price
                  ? formatNumber(price)
                  : formatNumber(productDetail?.product?.price)}
                ₫
              </p>
              <p class="text-gray-300 text-xl">
                <strike>
                  {formatNumber(productDetail?.product?.originalPrice)}₫
                </strike>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center mt-4 space-x-1">
                {renderStars(productDetail?.product?.ratingAverage)}
              </div>
              <div className="flex items-center mt-4 space-x-4">
                <h4 className="text-base text-gray-700">
                  {formatNumber(productDetail?.product?.ratingCount)} đánh giá
                </h4>
                <h4 className="text-base text-gray-700">
                  {formatNumber(productDetail?.product?.allTimeQuantitySold)} đã
                  mua
                </h4>
              </div>
            </div>

            <form className="flex items-center max-w-full gap-5 mt-8">
              <label
                htmlFor="quantity-input"
                className="block mr-2 font-medium text-gray-500 text-ms dark:text-white"
              >
                Số lượng:
              </label>
              <div className="relative flex items-center max-w-[8rem]">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="p-3 bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 rounded-s-lg h-9 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                >
                  <svg
                    className="w-3 h-3 text-gray-900 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 2"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 1h16"
                    />
                  </svg>
                </button>
                <input
                  type="text"
                  id="quantity-input"
                  value={quantity}
                  onChange={handleChange}
                  className="bg-gray-50 border-x-0 border-gray-300 h-9 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-1/3 py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="p-3 bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 rounded-e-lg h-9 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                >
                  <svg
                    className="w-3 h-3 text-gray-900 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 18"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 1v16M1 9h16"
                    />
                  </svg>
                </button>
              </div>
              <label
                htmlFor="quantity-input"
                className="block mr-2 text-xs font-medium text-gray-300 dark:text-white"
              >
                {formatNumber(productDetail?.product?.quantity)} sản phẩm có sẵn
              </label>
            </form>

            {/* <div className="max-w-full mt-8">
              <h3 className="font-medium text-gray-600 text-ms">Lựa chọn 1: </h3>
              <div className="grid grid-cols-6 gap-4 mt-2">
                {productDetail?.productChildren
                  ?.slice(0, 6)
                  .map((option, index) => (
                    <button
                      key={option.id}
                      className="relative flex items-center text-sm font-medium text-gray-900 bg-gray-100 rounded-md cursor-pointer h-14 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50"
                      onClick={() => (
                        setSelectedOptionIndex(index),
                        setPrice(option?.price),
                        setIdProductOptionValue(option?.id),
                        setProductOptionImage(option?.thumbnail_url)
                      )}
                    >
                      <p className="z-10 pl-16 text-xs text-left pr-2">
                        {option.option1}
                      </p>
                      <span className="absolute inset-0 overflow-hidden rounded-md">
                        <img
                          src={option.thumbnail_url}
                          alt={option.name}
                          className="z-0 object-cover object-center w-12 h-12 mx-1 mt-1"
                        />
                      </span>

                      <span
                        className={classNames(
                          selectedOptionIndex === index
                            ? "ring-indigo-500"
                            : "ring-transparent",
                          "absolute inset-0 rounded-md ring-2 ring-offset-2 pointer-events-none"
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
              </div>
            </div> */}

            {/* Cập nhật option 1 */}
            {option1 ? (
              <div className="max-w-full mt-8">
                <h3 className="font-medium text-gray-600 text-ms">
                  Chọn <span className="lowercase">{option1.option?.name}</span>
                  :
                </h3>
                <div className="grid grid-cols-6 gap-4 mt-2">
                  {option1?.productOptionValues
                    ?.slice(0, 6)
                    .map((option, index) => (
                      <button
                        key={option?.id}
                        className="relative flex items-center text-sm font-medium text-gray-900 bg-gray-100 rounded-md cursor-pointer h-14 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50"
                        onClick={() => (
                          setSelectedOption1Index(index),
                          // setPrice(option?.price),
                          setIdProductOption1Value(option?.id),
                          setProductOption1Image(option?.imageUrl)
                        )}
                      >
                        <p className="z-10 pl-16 text-xs text-left pr-2">
                          {option?.name}
                        </p>
                        <span className="absolute inset-0 overflow-hidden rounded-md">
                          <img
                            src={option?.imageUrl}
                            alt={option?.name}
                            className="z-0 object-cover object-center w-12 h-12 mx-1 mt-1"
                          />
                        </span>

                        <span
                          className={classNames(
                            selectedOption1Index === index
                              ? "ring-indigo-500"
                              : "ring-transparent",
                            "absolute inset-0 rounded-md ring-2 ring-offset-2 pointer-events-none"
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              <></>
            )}

            {/* Cập nhật option 2 */}
            {option2 ? (
              <div className="max-w-full mt-8">
                <h3 className="font-medium text-gray-600 text-ms">
                  Chọn <span className="lowercase">{option2.option?.name}</span>
                  :
                </h3>
                <div className="grid grid-cols-6 gap-4 mt-2">
                  {option2?.productOptionValues
                    ?.slice(0, 12)
                    .map((option, index) => (
                      <button
                        key={option.id}
                        className="relative flex items-center text-sm font-medium text-gray-900 bg-gray-100 rounded-md cursor-pointer h-14 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50"
                        onClick={() => (
                          setSelectedOption2Index(index),
                          // setPrice(option?.price),
                          setIdProductOption2Value(option?.id),
                          setProductOption2Image(option?.imageUrl)
                        )}
                      >
                        <p className="z-10 pl-16 text-xs text-left pr-2">
                          {option?.name}
                        </p>
                        <span className="absolute inset-0 overflow-hidden rounded-md">
                          <img
                            src={option?.imageUrl}
                            alt={option?.name}
                            className="z-0 object-cover object-center w-12 h-12 mx-1 mt-1"
                          />
                        </span>

                        <span
                          className={classNames(
                            selectedOption2Index === index
                              ? "ring-indigo-500"
                              : "ring-transparent",
                            "absolute inset-0 rounded-md ring-2 ring-offset-2 pointer-events-none"
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              <div className="mt-16"></div>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <p className="text-2xl font-semibold text-gray-700">Tạm tính: </p>
              <p className="text-4xl font-semibold text-gray-700">
                {totalPrice
                  ? formatNumber(totalPrice)
                  : formatNumber(productDetail?.product?.price)}
                ₫
              </p>
            </div>

            <div class="w-full grid grid-cols-2 gap-6 justify-between mt-8">
              <button
                type="button"
                className="h-16 p-4 py-3 bg-blue-700 hover:bg-blue-800 text-white text-xl font-semibold rounded shadow-lg shadow-blue-500/50"
                onClick={handleBuyNow}
              >
                Mua ngay
              </button>
              <button
                type="button"
                class="px-4 py-2.5 border bg-transparent text-blue-700 hover:border-blue-700 text-xl font-semibold rounded shadow-md"
                onClick={handleAddCart}
              >
                Thêm vào giỏ hàng
              </button>
              {/* <ToastContainer /> */}
            </div>
          </div>
        </div>
      </div>

      <div class="w-4/5 p-6 mt-8 grid items-start grid-cols-1 lg:grid-cols-7 gap-8 bg-white">
        <div
          onClick={(e) => {
            e.preventDefault();
            navigate(`/shoppage/${productDetail?.seller.iD_NK}`);
          }}
          class="lg:col-span-3 cursor-pointer"
        >
          <div class="flex items-start w-full gap-4">
            <img
              src={productDetail?.seller?.imageUrl || Default_Avatar}
              alt={productDetail?.seller?.name}
              className="w-12 h-12 border-2 border-white rounded-full lg:w-20 lg:h-20"
            />

            <div class="lg:h-20 h-12 ml-3 grid items-center ">
              <h4 class="text-lg font-semibold w-48 text-gray-700">
                {productDetail?.seller?.name}
              </h4>
              <div className="flex items-center space-x-1">
                {renderStars(productDetail?.product?.ratingAverage)}
                <span className="px-1"></span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded hidden sm:block">
                  {productDetail?.product?.ratingAverage}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="items-center hidden h-20 lg:grid lg:col-span-2">
          <div className="flex justify-between">
            <p className="text-sm !ml-2 font-semibold text-gray-400">
              Chính hãng:
            </p>
            <p className="text-sm !ml-2 font-semibold text-blue-700">✓</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm !ml-2 font-semibold text-gray-400">
              Tổng sản phẩm:
            </p>
            <p className="text-sm !ml-2 font-semibold text-blue-700">
              {productDetail?.seller?.total}
            </p>
          </div>
        </div>

        <div className="items-center hidden h-20 lg:grid lg:col-span-2">
          <div className="flex justify-between">
            <p className="text-sm !ml-2 font-semibold text-gray-400">
              Số người theo dõi:
            </p>
            <p className="text-sm !ml-2 font-semibold text-blue-700">
              {formatNumber(productDetail?.seller?.totalFollower)}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm !ml-2 font-semibold text-gray-400">
              Tổng lượt đánh giá:
            </p>
            <p className="text-sm !ml-2 font-semibold text-blue-700">
              {formatNumber(productDetail?.seller?.reviewCount)}
            </p>
          </div>
        </div>
      </div>

      <div class="w-4/5 p-6 mt-8 bg-white">
        <h3 class="text-xl font-semibold text-black mb-4 uppercase">
          Mô tả sản phẩm
        </h3>
        <div
          className={classNames(
            hiddenDescription === true
              ? "overflow-hidden max-h-screen font-light"
              : " font-light overflow-visible h-auto"
          )}
          dangerouslySetInnerHTML={{
            __html: productDetail?.product?.description,
          }}
        />
        <div className="flex items-center justify-center ">
          <button
            className="justify-center p-1 mt-6 underline underline-offset-2 hover:text-blue-500"
            onClick={handleHiddenDescription}
          >
            {hiddenDescription === true ? "Xem thêm" : "Rút gọn"}
          </button>
        </div>
      </div>

      <div class="w-4/5 p-6 my-8 bg-white">
        <div>
          <h3 class="text-lg font-semibold text-gray-700 uppercase">
            Đánh giá ({comments?.total})
          </h3>

          <CommentRating
            commentRating={commentRating}
            totalComment={comments?.total}
          />
        </div>

        {comments?.detailComment?.length === 0 && (
          <p className="flex items-center justify-center mt-6">
            Không có bình luận về sản phẩm
          </p>
        )}

        {comments?.detailComment?.length !== 0 && (
          <CommentDetail comments={comments?.comment} />
        )}
      </div>

      {otherShopProduct ? (
        <div id="recommendProduct" className="mt-4 mb-8">
          <MaxWidthWrapper>
            <div className="flex justify-between">
              <span className="text-xl font-semibold text-black uppercase">
                Sản phẩm khác của shop
              </span>
              <a
                href="#a"
                className="flex items-center text-red-700 hover:underline"
                // onClick={() => handleViewAll("new")}
              >
                Xem tất cả{" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </a>
            </div>
            <div className="flex items-center justify-between flex-nowrap lg:py-4 lg:rounded-md lg:gap-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5">
                {otherShopProduct &&
                  otherShopProduct
                    .slice(0, 5)
                    .map((product) => (
                      <ProductCard
                        key={product.product?.iD_NK}
                        image={product?.images[0].image}
                        product={product.product}
                      />
                    ))}
              </div>
            </div>
          </MaxWidthWrapper>
        </div>
      ) : (
        <></>
      )}

      <div id="otherProductShop" className="mt-4 mb-8">
        <MaxWidthWrapper>
          <div className="flex justify-between">
            <span className="text-xl font-semibold text-black uppercase">
              Sản phẩm liên quan
            </span>
            <a
              href="#a"
              className="flex items-center text-red-700 hover:underline"
              // onClick={() => handleViewAll("new")}
            >
              Xem tất cả{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </a>
          </div>
          <div className="flex items-center justify-between flex-nowrap lg:py-4 lg:rounded-md lg:gap-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5">
              {recommendProduct.map((product) => (
                <ProductCard
                  key={product?.iD_NK}
                  image={product?.image}
                  product={product}
                />
              ))}
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    </div>
  );
};

export default ProductDetailPage;