import Head from "next/head";
import Link from "next/link";
import Header from "@/components/Header";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import { useEffect, useState } from "react";
import axios from "axios";
import { BsTrash, BsClock } from "react-icons/bs";
import { FaCheck } from 'react-icons/fa';
import { useRouter } from "next/router";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { useTranslation } from "react-i18next";
import PaginationBar from "@/components/PaginationBar";
import Footer from "@/components/Footer";
import { getUserInfo, getFavoriteProductsCount, handleSelectUserLanguage } from "../../../../public/global_functions/popular";
import NotFoundError from "@/components/NotFoundError";
import SectionLoader from "@/components/SectionLoader";
import { useDispatch, useSelector } from "react-redux";

export default function CustomerFavoriteProductsList() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [allFavoriteProductsInsideThePage, setAllFavoriteProductsInsideThePage] = useState([]);

    const [isGetFavoriteProducts, setIsGetFavoriteProducts] = useState(true);

    const [selectedFavoriteProduct, setSelectedFavoriteProduct] = useState(-1);

    const [isDeletingFavoriteProduct, setIsDeletingFavoriteProduct] = useState(false);

    const [isSuccessDeletingFavoriteProduct, setIsSuccessDeletingFavoriteProduct] = useState(false);

    const [errorMsgOnDeletingFavoriteProduct, setErrorMsgOnDeletingFavoriteProduct] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        customerId: "",
    });

    const pageSize = 2;

    const router = useRouter();

    const { t, i18n } = useTranslation();

    const productsCountInFavorite = useSelector(state => state.productsCountInFavorite);

    const dispatch = useDispatch();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.languageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
        if (userToken) {
            getUserInfo()
                .then(async (result) => {
                    if (!result.error) {
                        setFilters({ ...filters, customerId: result.data._id });
                        const result2 = await getFavoriteProductsCount(`customerId=${result.data._id}`);
                        if (result2.data > 0) {
                            setAllFavoriteProductsInsideThePage((await getAllFavoriteProductsInsideThePage(1, pageSize, `customerId=${result.data._id}`)).data);
                            setTotalPagesCount(Math.ceil(result2.data / pageSize));
                        }
                        setWindowInnerWidth(window.innerWidth);
                        window.addEventListener("resize", () => {
                            setWindowInnerWidth(window.innerWidth);
                        });
                        setIsGetFavoriteProducts(false);
                    } else {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                        await router.replace("/auth");
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.replace("/auth");
                    }
                    else {
                        setIsLoadingPage(false);
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                    }
                });
        } else {
            router.replace("/auth");
        }
    }, []);

    useEffect(() => {
        if (!isGetFavoriteProducts) {
            setIsLoadingPage(false);
        }
    }, [isGetFavoriteProducts]);

    const getAllFavoriteProductsInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/favorite-products/all-favorite-products-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.userTokenNameInLocalStorage),
                }
            })).data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getPreviousPage = async () => {
        setIsGetFavoriteProducts(true);
        const newCurrentPage = currentPage - 1;
        setAllFavoriteProductsInsideThePage((await getAllFavoriteProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsGetFavoriteProducts(false);
    }

    const getNextPage = async () => {
        setIsGetFavoriteProducts(true);
        const newCurrentPage = currentPage + 1;
        setAllFavoriteProductsInsideThePage((await getAllFavoriteProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsGetFavoriteProducts(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsGetFavoriteProducts(true);
        setAllFavoriteProductsInsideThePage((await getAllFavoriteProductsInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data);
        setCurrentPage(pageNumber);
        setIsGetFavoriteProducts(false);
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.customerId) filteringString += `customerId=${filters.customerId}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const deleteProductFromFavoriteUserProducts = async (favoriteProductIndex) => {
        try {
            setIsDeletingFavoriteProduct(true);
            setSelectedFavoriteProduct(favoriteProductIndex);
            await axios.delete(`${process.env.BASE_API_URL}/favorite-products/${allFavoriteProductsInsideThePage[favoriteProductIndex].productId}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.userTokenNameInLocalStorage)
                }
            });
            setIsDeletingFavoriteProduct(false);
            setIsSuccessDeletingFavoriteProduct(true);
            let successDeletingFavoriteProductMsgTimeOut = setTimeout(async () => {
                dispatch({
                    type: "(Add / Delete) (To / From ) Favorite",
                    productsCountInFavorite: productsCountInFavorite - 1
                });
                const result = await getFavoriteProductsCount();
                if (result.data > 0) {
                    setAllFavoriteProductsInsideThePage((await getAllFavoriteProductsInsideThePage(1, pageSize)).data);
                    setTotalPagesCount(Math.ceil(result.data / pageSize));
                } else {
                    setAllFavoriteProductsInsideThePage([]);
                    setTotalPagesCount(0);
                }
                setSelectedFavoriteProduct(-1);
                setIsSuccessDeletingFavoriteProduct(false);
                clearTimeout(successDeletingFavoriteProductMsgTimeOut);
            }, 1500);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setIsDeletingFavoriteProduct(false);
                setErrorMsgOnDeletingFavoriteProduct(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let successDeletingFavoriteProductMsgTimeOut = setTimeout(() => {
                    setErrorMsgOnDeletingFavoriteProduct("");
                    setSelectedFavoriteProduct(-1);
                    clearTimeout(successDeletingFavoriteProductMsgTimeOut);
                }, 1500);
            }
        }
    }

    return (
        <div className="customer-favorite-products-list customer-dashboard customer-products-list">
            <Head>
                <title>{t(process.env.storeName)} - {t("Customer Favorite Products")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content page pt-5">
                    <div className="container-fluid align-items-center pb-4">
                        <div className="row align-items-center">
                            <div className="col-xl-3">
                                <CustomerDashboardSideBar />
                            </div>
                            <div className="col-xl-9">
                                {allFavoriteProductsInsideThePage.length > 0 && !isGetFavoriteProducts && <section className="favorite-products-list-for-user data-box text-center">
                                    {windowInnerWidth > 991 ? <table className="favorite-products-table-for-user data-table mb-4 w-100">
                                        <thead>
                                            <tr>
                                                <th>{t("Product")}</th>
                                                <th>{t("Unit Price")}</th>
                                                <th>{t("Stock Status")}</th>
                                                <th>{t("Action")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allFavoriteProductsInsideThePage.map((favoriteProduct, favoriteProductIndex) => (
                                                <tr key={favoriteProduct._id}>
                                                    <td>
                                                        <img
                                                            src={`${process.env.BASE_API_URL}/${favoriteProduct.imagePath}`}
                                                            alt="favorite product image"
                                                            className="favorite-product-image d-block mx-auto mb-3"
                                                            width="100"
                                                            height="100"
                                                        />
                                                        <h6>{favoriteProduct.name}</h6>
                                                    </td>
                                                    <td>{favoriteProduct.price.toFixed(2)} {t("EUR")}</td>
                                                    <td>{t("Stock Status")}</td>
                                                    <td>
                                                        {selectedFavoriteProduct !== favoriteProductIndex && <BsTrash className="delete-product-from-favorite-user-list-icon managment-favorite-products-icon" onClick={() => deleteProductFromFavoriteUserProducts(favoriteProductIndex)} />}
                                                        {isDeletingFavoriteProduct && selectedFavoriteProduct === favoriteProductIndex && <BsClock className="wait-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
                                                        {isSuccessDeletingFavoriteProduct && selectedFavoriteProduct === favoriteProductIndex && <FaCheck className="success-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
                                                        {errorMsgOnDeletingFavoriteProduct && selectedFavoriteProduct === favoriteProductIndex && <FaCheck className="error-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
                                                        <Link
                                                            href={`/product-details/${favoriteProduct.productId}`}
                                                            className="btn btn-success d-block mx-auto mb-4 global-button mt-4 w-75"
                                                        >{t("Show Product Details")}</Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table> : <div className="favorite-products-for-user">
                                        {allFavoriteProductsInsideThePage.map((favoriteProduct, favoriteProductIndex) => (
                                            <div className="favorite-product data-box mb-5" key={favoriteProduct._id}>
                                                <h4 className="mb-3 text-white">{t("Product")} # {favoriteProductIndex + 1}</h4>
                                                <table className="favorite-products-table-for-user data-table w-100">
                                                    <tbody>
                                                        <tr>
                                                            <th>{t("Product")}</th>
                                                            <td>
                                                                <img
                                                                    src={`${process.env.BASE_API_URL}/${favoriteProduct.imagePath}`}
                                                                    alt="favorite product image"
                                                                    className="favorite-product-image d-block mx-auto mb-3"
                                                                    width="100"
                                                                    height="100"
                                                                />
                                                                <h6>{favoriteProduct.name}</h6>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>{t("Unit Price")}</th>
                                                            <td>{favoriteProduct.price.toFixed(2)} {t("EUR")}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>{t("Stock Status")}</th>
                                                            <td>{t("Stock Status")}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>{t("Action")}</th>
                                                            <td>
                                                                {selectedFavoriteProduct !== favoriteProductIndex && <BsTrash className="delete-product-from-favorite-user-list-icon managment-favorite-products-icon" onClick={() => deleteProductFromFavoriteUserProducts(favoriteProductIndex)} />}
                                                                {isDeletingFavoriteProduct && selectedFavoriteProduct === favoriteProductIndex && <BsClock className="wait-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
                                                                {isSuccessDeletingFavoriteProduct && selectedFavoriteProduct === favoriteProductIndex && <FaCheck className="success-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
                                                                <Link
                                                                    href={`/product-details/${favoriteProduct._id}`}
                                                                    className="btn btn-success d-block mx-auto mb-4 mt-4 w-75"
                                                                >{t("Show Details")}</Link>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>}
                                </section>}
                                {allFavoriteProductsInsideThePage.length === 0 && !isGetFavoriteProducts && <NotFoundError errorMsg={t("Sorry, Can't Find Any Favorite Products For You !!")} />}
                                {isGetFavoriteProducts && <SectionLoader />}
                                {totalPagesCount > 1 &&
                                    <PaginationBar
                                        totalPagesCount={totalPagesCount}
                                        currentPage={currentPage}
                                        getPreviousPage={getPreviousPage}
                                        getNextPage={getNextPage}
                                        getSpecificPage={getSpecificPage}
                                        paginationButtonTextColor={"#FFF"}
                                        paginationButtonBackgroundColor={"transparent"}
                                        activePaginationButtonColor={"#000"}
                                        activePaginationButtonBackgroundColor={"#FFF"}
                                        isDisplayCurrentPageNumberAndCountOfPages={false}
                                        isDisplayNavigateToSpecificPageForm={false}
                                    />
                                }
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}