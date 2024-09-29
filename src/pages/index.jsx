import Head from "next/head";
import Header from "@/components/Header";
import Link from "next/link";
import { MdKeyboardArrowRight, MdOutlineMail } from "react-icons/md";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import { FaTimes, FaWhatsapp } from "react-icons/fa";
import { MdOutlineContactPhone } from "react-icons/md";
import { useTranslation } from "react-i18next";
import PaginationBar from "@/components/PaginationBar";
import ShareOptionsBox from "@/components/ShareOptionsBox";
import ProductCard from "@/components/ProductCard";
import {
    getProductsCount,
    getAllProductsInsideThePage,
    isExistProductInsideTheCart,
    getCategoriesCount,
    getAllCategoriesInsideThePage,
    getFlashProductsCount,
    getAllFlashProductsInsideThePage,
    isExistOfferOnProduct,
    getFavoriteProductsByProductsIdsAndUserId,
    isFavoriteProductForUser,
    getUserInfo,
    handleSelectUserLanguage
} from "../../public/global_functions/popular";
import { FaSearch } from "react-icons/fa";
import NotFoundError from "@/components/NotFoundError";
import SectionLoader from "@/components/SectionLoader";
import NavigateToUpOrDown from "@/components/NavigateToUpOrDown";
import BrandCard from "@/components/BrandCard";
import ErrorPopup from "@/components/ErrorPopup";
import { Carousel } from "react-bootstrap";
import StoreLogo from "../../public/images/storeLogo.png";

export default function Home() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [isDisplayErrorPopup, setIsDisplayErrorPopup] = useState(false);

    const [errorType, setErrorType] = useState("");

    const [isGetCategories, setIsGetCategories] = useState(true);

    const [isGetProducts, setIsGetProducts] = useState(true);

    const [isGetFlashProducts, setIsGetFlashProducts] = useState(true);

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [isGetBrands, setIsGetBrands] = useState(true);

    const [allTextAds, setAllTextAds] = useState([]);

    const [allImageAds, setAllImageAds] = useState([]);

    const [allCategoriesInsideThePage, setAllCategoriesInsideThePage] = useState([]);

    const [favoriteProductsListForUserByProductsIdsAndUserId, setFavoriteProductsListForUserByProductsIdsAndUserId] = useState([]);

    const [allFlashProductsInsideThePage, setAllFlashProductsInsideThePage] = useState([]);

    const [isExistFlashProductsInDBInGeneral, setIsExistFlashProductsInDBInGeneral] = useState(false);

    const [allProductsInsideThePage, setAllProductsInsideThePage] = useState([]);

    const [isExistProductsInDBInGeneral, setIsExistProductsInDBInGeneral] = useState(false);

    const [currentDate, setCurrentDate] = useState("");

    const [currentPage, setCurrentPage] = useState({
        forCategories: 1,
        forFlashProducts: 1,
        forProducts: 1,
        forStores: 1,
    });

    const [totalPagesCount, setTotalPagesCount] = useState({
        forCategories: 0,
        forFlashProducts: 0,
        forProducts: 0,
    });

    const [filters, setFilters] = useState({
        forFlashProducts: {
            name: "",
            offerDescription: "",
        },
        forProducts: {
            name: "",
        },
        status: "approving"
    });

    const [sortDetails, setSortDetails] = useState({
        forFlashProducts: {
            by: "",
            type: 1,
        },
        forProducts: {
            by: "",
            type: 1,
        },
    });

    const [isDisplayShareOptionsBox, setIsDisplayShareOptionsBox] = useState(false);

    const [sharingName, setSharingName] = useState("");

    const [sharingURL, setSharingURL] = useState("");

    const [appearedSections, setAppearedSections] = useState([]);

    const [lastSevenBrands, setLastSevenBrands] = useState([]);

    const [isDisplayContactIcons, setIsDisplayContactIcons] = useState(false);

    const { i18n, t } = useTranslation();

    const pageSizes = {
        forCategories: 16,
        forFlashProducts: 9,
        forProducts: 9,
        forStores: 9,
    };

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.languageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        setWindowInnerWidth(window.innerWidth);
    }, []);

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
        if (userToken) {
            getUserInfo()
                .then((result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                    }
                })
                .catch((err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                    }
                    else {
                        setIsLoadingPage(false);
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                    }
                });
        }
    }, []);

    useEffect(() => {
        setIsLoadingPage(true);
        handleIsGetAllHomeData();
        // ==========================================================================================
        getAllAds()
            .then(async (result) => {
                setIsLoadingPage(false);
                let allTextAdsTemp = [], allImageAdsTemp = [];
                result.data.forEach((ad) => {
                    if (ad.type === "text") allTextAdsTemp.push(ad);
                    else allImageAdsTemp.push(ad);
                    setAllTextAds(allTextAdsTemp);
                    setAllImageAds(allImageAdsTemp);
                });
                let totalPagesCountTemp = {
                    forCategories: 0,
                    forFlashProducts: 0,
                    forProducts: 0,
                    forStores: 0,
                }
                result = await getCategoriesCount();
                if (result.data > 0) {
                    setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(1, pageSizes.forCategories)).data);
                    totalPagesCountTemp.forCategories = Math.ceil(result.data / pageSizes.forCategories);
                    setTotalPagesCount(totalPagesCountTemp);
                }
                setIsGetCategories(false);
                // =============================================================================
                const { flashProductsCount, flashProductsData, currentDateTemp } = await handleGetFlashProducts();
                setCurrentDate(currentDateTemp);
                setAllFlashProductsInsideThePage(flashProductsData);
                totalPagesCountTemp.forFlashProducts = Math.ceil(flashProductsCount / pageSizes.forFlashProducts);
                setTotalPagesCount(totalPagesCountTemp);
                if (flashProductsData.length > 0) {
                    setIsExistFlashProductsInDBInGeneral(true);
                }
                setIsGetFlashProducts(false);
                // =============================================================================
                const { productsCount, productsData } = await handleGetProducts();
                setAllProductsInsideThePage(productsData);
                totalPagesCountTemp.forProducts = Math.ceil(productsCount / pageSizes.forProducts);
                setTotalPagesCount(totalPagesCountTemp);
                if (productsData.length > 0) {
                    setIsExistProductsInDBInGeneral(true);
                }
                // =============================================================================
                await handleGetAndSetFavoriteProductsByProductsIdsAndUserId(
                    handleCreateProductsIdsToGetFavoriteProductsForUser(
                        flashProductsData.map((flashProduct) => flashProduct._id),
                        productsData.map((product) => product._id)
                    )
                );
                setIsGetProducts(false);
                // =============================================================================
                const appearedSectionsResult = await getAppearedSections();
                const appearedSectionsLength = appearedSectionsResult.data.length;
                setAppearedSections(appearedSectionsLength > 0 ? appearedSectionsResult.data.map((appearedSection) => appearedSection.isAppeared ? appearedSection.sectionName : "") : []);
                if (appearedSectionsLength > 0) {
                    for (let i = 0; i < appearedSectionsLength; i++) {
                        if (appearedSectionsResult.data[i].sectionName === "brands" && appearedSectionsResult.data[i].isAppeared) {
                            setLastSevenBrands((await getLastSevenBrands()).data);
                            setIsGetBrands(false);
                        }
                    }
                }
                setTotalPagesCount(totalPagesCountTemp);
            })
            .catch(async (err) => {
                if (err?.response?.status === 401) {
                    localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                    setIsLoadingPage(false);
                }
                else {
                    setIsLoadingPage(false);
                    setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                }
            });
        // =============================================================================
    }, []);

    useEffect(() => {
        window.addEventListener("resize", function () {
            setWindowInnerWidth(this.innerWidth);
        });
    }, []);

    const handleIsGetAllHomeData = () => {
        setIsGetCategories(true);
        setIsGetProducts(true);
        setIsGetFlashProducts(true);
        setIsGetBrands(true);
    }

    const getAllAds = async () => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/ads/all-ads`)).data;
        }
        catch (err) {
            throw err;
        }
    }

    const handleGetFlashProducts = async (filtersAsString, sortDetailsAsString) => {
        try {
            const result = await getFlashProductsCount(filtersAsString);
            if (result.data > 0) {
                const result1 = (await getAllFlashProductsInsideThePage(1, pageSizes.forFlashProducts, filtersAsString, sortDetailsAsString)).data;
                return {
                    flashProductsCount: result.data,
                    flashProductsData: result1.products,
                    currentDateTemp: result1.currentDate
                }
            }
            return {
                flashProductsCount: 0,
                flashProductsData: [],
                currentDate: Date.now()
            }
        }
        catch (err) {
            throw err;
        }
    }

    const handleGetProducts = async (filtersAsString, sortDetailsAsString) => {
        try {
            const result = await getProductsCount(filtersAsString);
            if (result.data > 0) {
                return {
                    productsCount: result.data,
                    productsData: (await getAllProductsInsideThePage(1, pageSizes.forProducts, filtersAsString, sortDetailsAsString)).data.products
                }
            }
            return {
                productsCount: 0,
                productsData: [],
            }
        }
        catch (err) {
            throw err;
        }
    }

    const handleCreateProductsIdsToGetFavoriteProductsForUser = (flashProductsIds, productsIds) => {
        return Array.from(new Set(flashProductsIds.concat(productsIds)));
    }

    const handleGetAndSetFavoriteProductsByProductsIdsAndUserId = async (productsIds) => {
        try {
            const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
            if (userToken) {
                setFavoriteProductsListForUserByProductsIdsAndUserId((await getFavoriteProductsByProductsIdsAndUserId(productsIds)).data);
            }
        }
        catch (err) {
            throw err;
        }
    }

    const getAppearedSections = async () => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/appeared-sections/all-sections`)).data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getLastSevenBrands = async (filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/brands/last-seven-brands?${filters ? filters : ""}`)).data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getFiltersAsQuery = (filters) => {
        let filtersAsQuery = "";
        if (filters.name) filtersAsQuery += `name=${filters.name}&`;
        if (filters.offerDescription) filtersAsQuery += `offerDescription=${filters.offerDescription}&`;
        if (filters.storeId) filtersAsQuery += `storeId=${filters.storeId}&`;
        if (filters.status) filtersAsQuery += `status=${filters.status}&`;
        if (filtersAsQuery) filtersAsQuery = filtersAsQuery.substring(0, filtersAsQuery.length - 1);
        return filtersAsQuery;
    }

    const getSortDetailsAsQuery = (sortDetails) => {
        let sortDetailsAsQuery = "";
        if (sortDetails.by && sortDetails.type) sortDetailsAsQuery += `sortBy=${sortDetails.by}&sortType=${sortDetails.type}`;
        return sortDetailsAsQuery;
    }

    const getPreviousPage = async (section) => {
        if (section === "categories") {
            setIsGetCategories(true);
            const newCurrentPage = currentPage.forCategories - 1;
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(newCurrentPage, pageSizes.forCategories)).data);
            setCurrentPage({ ...currentPage, forCategories: newCurrentPage });
            setIsGetCategories(false);
        }
        else if (section === "products") {
            setIsGetProducts(true);
            const newCurrentPage = currentPage.forProducts - 1;
            setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSizes.forProducts, getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails))).data.products);
            setCurrentPage({ ...currentPage, forProducts: newCurrentPage });
            setIsGetProducts(false);
        }
    }

    const getNextPage = async (section) => {
        if (section === "categories") {
            setIsGetCategories(true);
            const newCurrentPage = currentPage.forCategories + 1;
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(newCurrentPage, pageSizes.forCategories)).data);
            setCurrentPage({ ...currentPage, forCategories: newCurrentPage });
            setIsGetCategories(false);
        }
        else if (section === "products") {
            setIsGetProducts(true);
            const newCurrentPage = currentPage.forProducts + 1;
            setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSizes.forProducts, getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails))).data.products);
            setCurrentPage({ ...currentPage, forProducts: newCurrentPage });
            setIsGetProducts(false);
        }
    }

    const getSpecificPage = async (pageNumber, section) => {
        if (section === "categories") {
            setIsGetCategories(true);
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(pageNumber, pageSizes.forCategories)).data);
            setCurrentPage({ ...currentPage, forCategories: pageNumber });
            setIsGetCategories(false);
        }
        else if (section === "products") {
            setIsGetProducts(true);
            setAllProductsInsideThePage((await getAllProductsInsideThePage(pageNumber, pageSizes.forProducts, getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails))).data.products);
            setCurrentPage({ ...currentPage, forProducts: pageNumber });
            setIsGetProducts(false);
        }
    }

    const handleChangeFilters = (e, section) => {
        e.preventDefault();
        if (section === "flash-products") {
            const tempFilters = {
                ...filters,
                forFlashProducts: {
                    ...filters.forFlashProducts,
                    name: e.target.value.trim(),
                }
            };
            setFilters(tempFilters);
            searchOnProduct(e, "flash", tempFilters.forFlashProducts, sortDetails.forFlashProducts);
        } else {
            const tempFilters = {
                ...filters,
                forProducts: {
                    ...filters.forProducts,
                    name: e.target.value.trim(),
                }
            };
            setFilters(tempFilters);
            searchOnProduct(e, "normal", tempFilters.forProducts, sortDetails.forProducts);
        }
    }

    const handleChangeSorts = (e, section) => {
        e.preventDefault();
        if (section === "flash-products") {
            const sortDetailsArray = e.target.value.split(",");
            const tempSortDetails = {
                ...sortDetails,
                forFlashProducts: { by: sortDetailsArray[0], type: sortDetailsArray[1] }
            };
            setSortDetails(tempSortDetails);
            searchOnProduct(e, "flash", filters.forFlashProducts, tempSortDetails.forFlashProducts);
        } else {
            const sortDetailsArray = e.target.value.split(",");
            const tempSortDetails = {
                ...sortDetails,
                forProducts: { by: sortDetailsArray[0], type: sortDetailsArray[1] }
            };
            setSortDetails(tempSortDetails);
            searchOnProduct(e, "normal", filters.forProducts, tempSortDetails.forProducts);
        }
    }

    const searchOnProduct = async (e, productType, filters, sortDetails) => {
        try {
            e.preventDefault();
            if (productType === "normal") {
                setIsGetProducts(true);
                setCurrentPage({ ...currentPage, forProducts: 1 });
                const { productsCount, productsData } = await handleGetProducts(getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails));
                setTotalPagesCount({
                    ...totalPagesCount,
                    forProducts: Math.ceil(productsCount / pageSizes.forProducts)
                });
                setAllProductsInsideThePage(productsData);
                await handleGetAndSetFavoriteProductsByProductsIdsAndUserId(
                    handleCreateProductsIdsToGetFavoriteProductsForUser(
                        allFlashProductsInsideThePage.map((flashProduct) => flashProduct._id),
                        productsData.map((product) => product._id)
                    )
                );
                setIsGetProducts(false);
            } else {
                setIsGetFlashProducts(true);
                const { flashProductsCount, flashProductsData, currentDateTemp } = await handleGetFlashProducts(getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails));
                setCurrentDate(currentDateTemp);
                setTotalPagesCount({
                    ...totalPagesCount,
                    forFlashProducts: Math.ceil(flashProductsCount / pageSizes.forFlashProducts)
                });
                setAllFlashProductsInsideThePage(flashProductsData);
                await handleGetAndSetFavoriteProductsByProductsIdsAndUserId(
                    handleCreateProductsIdsToGetFavoriteProductsForUser(
                        flashProductsData.map((flashProduct) => flashProduct._id),
                        allProductsInsideThePage.map((product) => product._id)
                    )
                );
                setIsGetFlashProducts(false);
            }
        }
        catch (err) {
            setIsGetFlashProducts(false);
            setIsGetProducts(false);
            setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    return (
        <div className="home page">
            <Head>
                <title>{t(process.env.storeName)} - {t("Home")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                {/* Start Share Options Box */}
                {isDisplayShareOptionsBox && <ShareOptionsBox
                    setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox}
                    sharingName={sharingName}
                    sharingURL={sharingURL}
                />}
                {isDisplayErrorPopup && <ErrorPopup
                    setIsDisplayErrorPopup={setIsDisplayErrorPopup}
                    errorType={errorType}
                />}
                <NavigateToUpOrDown />
                {/* End Share Options Box */}
                <div className={`page-content ${allTextAds.length === 0 && "pt-5"}`}>
                    {/* Start Text Ads Section */}
                    {allTextAds.length > 0 && <section className="text-ads text-center p-3 bg-dark mb-5">
                        <Carousel indicators={false} controls={false}>
                            {allTextAds.map((ad, index) => (
                                <Carousel.Item key={index}>
                                    <Carousel.Caption>
                                        <p className="ad-content text-white m-0">{ad.content}</p>
                                    </Carousel.Caption>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </section>}
                    {/* End Text Ads Section */}
                    <div className="container-fluid">
                        {/* Start Store Details Section */}
                        <section className="store-details text-white text-center mb-5">
                            <img
                                src={StoreLogo.src}
                                alt="Seele Von Druck Store Image"
                                width="200"
                                height="200"
                                className="d-block mx-auto mb-5 store-image"
                            />
                            <h1 className="mb-5 border-bottom border-4 pb-3 welcome-msg mb-5 mw-100 mx-auto h3">{t("Welcome To You In Store")} {t(process.env.storeName)}</h1>
                            <h2 className="products-description mb-4 h4">Products Description</h2>
                        </section>
                        {/* End Store Details Section */}
                        {/* Start Categories Section */}
                        <section className="categories mb-5 pb-5" id="categories">
                            <h2 className="section-name text-center mb-4 text-white h4">{t("Categories")}</h2>
                            {isGetCategories && <SectionLoader />}
                            {!isGetCategories && allCategoriesInsideThePage.length > 0 && <div className="row mb-5">
                                {allCategoriesInsideThePage.map((category) => (
                                    <div className="col-md-3" key={category._id}>
                                        <div className="category-details p-3">
                                            <Link href={`/products-by-category?categoryId=${category._id}`} className="product-by-category-link text-dark">
                                                <h6 className="cateogory-name mb-3">{category.name}</h6>
                                                <MdKeyboardArrowRight className="forward-arrow-icon" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>}
                            {!isGetCategories && allCategoriesInsideThePage.length === 0 && <NotFoundError errorMsg={t("Sorry, Can't Find Any Categories For This Store !!")} />}
                            {totalPagesCount.forCategories > 1 &&
                                <PaginationBar
                                    totalPagesCount={totalPagesCount.forCategories}
                                    currentPage={currentPage.forCategories}
                                    getPreviousPage={getPreviousPage}
                                    getNextPage={getNextPage}
                                    getSpecificPage={getSpecificPage}
                                    paginationButtonTextColor={"#FFF"}
                                    paginationButtonBackgroundColor={"transparent"}
                                    activePaginationButtonColor={"#000"}
                                    activePaginationButtonBackgroundColor={"#FFF"}
                                    isDisplayCurrentPageNumberAndCountOfPages={false}
                                    isDisplayNavigateToSpecificPageForm={false}
                                    section="categories"
                                />
                            }
                        </section>
                        {/* End Categories Section */}
                        {/* Start Last Added Flash Products */}
                        <section className="last-added-flash-products mb-5 pb-3" id="latest-added-flash-products">
                            <h2 className="section-name text-center mb-4 text-white h4">{t("Flash Products")}</h2>
                            {isExistFlashProductsInDBInGeneral && <div className="row filters-and-sorting-box mb-4">
                                <div className="col-xs-12 col-md-6">
                                    <form className="search-form">
                                        <div className="product-name-field-box">
                                            <input
                                                type="text"
                                                placeholder={t("Please Enter The name Of The Product You Want To Search For")}
                                                className="form-control"
                                                onChange={(e) => handleChangeFilters(e, "flash-products")}
                                            />
                                            <div className={`icon-box ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                                <FaSearch className="icon" onClick={(e) => searchOnProduct(e, "flash", filters.forFlashProducts, sortDetails.forFlashProducts)} />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="col-xs-12 col-md-6">
                                    <form className="sort-form" onSubmit={(e) => searchOnProduct(e, "flash", filters.forFlashProducts, sortDetails.forFlashProducts)}>
                                        <div className="select-sort-type-box">
                                            <select
                                                className="select-sort-type form-select"
                                                onChange={(e) => handleChangeSorts(e, "flash-products")}
                                            >
                                                <option value="" hidden>{t("Sort By")}</option>
                                                <option value="postOfDate,1">{t("From Latest To Oldest")}</option>
                                                <option value="postOfDate,-1">{t("From Oldest To Latest")}</option>
                                                <option value="price,-1">{t("From Highest Price To Lowest")}</option>
                                                <option value="price,1">{t("From Lowest Price To Highest")}</option>
                                            </select>
                                        </div>
                                    </form>
                                </div>
                            </div>}
                            {isGetFlashProducts && <SectionLoader />}
                            <div className="row products-box section-data-box pt-4 pb-4">
                                {!isGetFlashProducts && allFlashProductsInsideThePage.length > 0 && allFlashProductsInsideThePage.map((product) => (
                                    <div className="col-xs-12 col-lg-6 col-xl-4" key={product._id}>
                                        <ProductCard
                                            productDetails={product}
                                            setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox}
                                            isFavoriteProductForUserAsProperty={isFavoriteProductForUser(favoriteProductsListForUserByProductsIdsAndUserId, product._id)}
                                            isExistProductInsideTheCartAsProperty={isExistProductInsideTheCart(product._id)}
                                            setSharingName={setSharingName}
                                            setSharingURL={setSharingURL}
                                            currentDateAsString={currentDate}
                                            isFlashProductAsProperty={true}
                                            isDisplayCountdown={true}
                                            setIsDisplayErrorPopup={setIsDisplayErrorPopup}
                                            setErrorType={setErrorType}
                                        />
                                    </div>
                                ))}
                                {!isGetFlashProducts && allFlashProductsInsideThePage.length === 0 && <NotFoundError errorMsg={t(!isExistFlashProductsInDBInGeneral ? "Sorry, Not Found Any Products Now !!" : "Sorry, Not Found Any Products Related In This Name !!")} />}
                                {totalPagesCount.forFlashProducts > 1 &&
                                    <PaginationBar
                                        totalPagesCount={totalPagesCount.forFlashProducts}
                                        currentPage={currentPage.forFlashProducts}
                                        getPreviousPage={getPreviousPage}
                                        getNextPage={getNextPage}
                                        getSpecificPage={getSpecificPage}
                                        paginationButtonTextColor={"#FFF"}
                                        paginationButtonBackgroundColor={"transparent"}
                                        activePaginationButtonColor={"#000"}
                                        activePaginationButtonBackgroundColor={"#FFF"}
                                        section="flash-products"
                                    />}
                            </div>
                        </section>
                        {/* End Last Added Flash Products */}
                        {/* Start Last Added Products */}
                        <section className="last-added-products mb-5 pb-3" id="latest-added-products">
                            <h2 className="section-name text-center mb-4 text-white h4">{t("Last Added Products")}</h2>
                            {isExistProductsInDBInGeneral && <div className="row filters-and-sorting-box mb-4">
                                <div className="col-xs-12 col-md-6">
                                    <form className="search-form">
                                        <div className="product-name-field-box">
                                            <input
                                                type="text"
                                                placeholder={t("Please Enter The name Of The Product You Want To Search For")}
                                                className="form-control"
                                                onChange={(e) => handleChangeFilters(e, "products")}
                                            />
                                            <div className={`icon-box ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                                <FaSearch className='icon' onClick={(e) => searchOnProduct(e, "normal", filters.forProducts, sortDetails.forProducts)} />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="col-xs-12 col-md-6">
                                    <form className="sort-form">
                                        <div className="select-sort-type-box">
                                            <select
                                                className="select-sort-type form-select"
                                                onChange={(e) => handleChangeSorts(e, "products")}
                                            >
                                                <option value="" hidden>{t("Sort By")}</option>
                                                <option value="postOfDate,1">{t("From Latest To Oldest")}</option>
                                                <option value="postOfDate,-1">{t("From Oldest To Latest")}</option>
                                                <option value="price,-1">{t("From Highest Price To Lowest")}</option>
                                                <option value="price,1">{t("From Lowest Price To Highest")}</option>
                                            </select>
                                        </div>
                                    </form>
                                </div>
                            </div>}
                            {isGetProducts && <SectionLoader />}
                            {!isGetProducts && allProductsInsideThePage.length === 0 && <NotFoundError errorMsg={t(!isExistProductsInDBInGeneral ? "Sorry, Not Found Any Products Now !!" : "Sorry, Not Found Any Products Related In This Name !!")} />}
                            <div className="row products-box section-data-box pt-4 pb-4">
                                {!isGetProducts && allProductsInsideThePage.length > 0 && allProductsInsideThePage.map((product) => (
                                    <div className="col-xs-12 col-lg-6 col-xl-4" key={product._id}>
                                        <ProductCard
                                            productDetails={product}
                                            setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox}
                                            isFavoriteProductForUserAsProperty={isFavoriteProductForUser(favoriteProductsListForUserByProductsIdsAndUserId, product._id)}
                                            isExistProductInsideTheCartAsProperty={isExistProductInsideTheCart(product._id)}
                                            setSharingName={setSharingName}
                                            setSharingURL={setSharingURL}
                                            currentDateAsString={currentDate}
                                            isFlashProductAsProperty={isExistOfferOnProduct(currentDate, product.startDiscountPeriod, product.endDiscountPeriod)}
                                            setIsDisplayErrorPopup={setIsDisplayErrorPopup}
                                            setErrorType={setErrorType}
                                        />
                                    </div>
                                ))}
                                {totalPagesCount.forProducts > 1 &&
                                    <PaginationBar
                                        totalPagesCount={totalPagesCount.forProducts}
                                        currentPage={currentPage.forProducts}
                                        getPreviousPage={getPreviousPage}
                                        getNextPage={getNextPage}
                                        getSpecificPage={getSpecificPage}
                                        paginationButtonTextColor={"#FFF"}
                                        paginationButtonBackgroundColor={"transparent"}
                                        activePaginationButtonColor={"#000"}
                                        activePaginationButtonBackgroundColor={"#FFF"}
                                        section="products"
                                    />}
                            </div>
                        </section>
                        {/* End Last Added Products */}
                        {/* Start Brands Section */}
                        {appearedSections.includes("brands") && lastSevenBrands.length > 0 && <section className="brands mb-5">
                            <h2 className="section-name text-center mb-5 text-white h4">{t("Brands")}</h2>
                            <div className="row brands-box section-data-box pt-4 pb-4">
                                {isGetBrands && <SectionLoader />}
                                {!isGetBrands && lastSevenBrands.length > 0 && lastSevenBrands.map((brand) => (
                                    <div className="col-xs-12 col-lg-6 col-xl-4" key={brand._id}>
                                        <BrandCard
                                            brandDetails={brand}
                                        />
                                    </div>
                                ))}
                                {!isGetBrands && lastSevenBrands.length === 0 && <NotFoundError errorMsg={t("Sorry, Not Found Any Brands !!")} />}
                            </div>
                            {!isGetBrands && lastSevenBrands.length !== 0 && <Link href="/all-brands" className="mb-4 d-block mx-auto text-center show-btn">{t("Show All Brands")}</Link>}
                        </section>}
                        {/* End Brands Section */}
                        <div className="contact-icons-box" onClick={() => setIsDisplayContactIcons(value => !value)}>
                            <ul className="contact-icons-list">
                                {isDisplayContactIcons && <li className="contact-icon-item mb-3">
                                    <a href={`mailto:${process.env.contactEmail}`} target="_blank"><MdOutlineMail className="mail-icon" /></a>
                                </li>}
                                {isDisplayContactIcons && appearedSections.includes("whatsapp button") && <li className="contact-icon-item mb-3">
                                    <a href={`https://wa.me/${process.env.contactNumber}?text=welcome`} target="_blank"><FaWhatsapp className="whatsapp-icon" /></a>
                                </li>}
                                {!isDisplayContactIcons && <li className="contact-icon-item"><MdOutlineContactPhone className="contact-icon" /></li>}
                                {isDisplayContactIcons && <li className="contact-icon-item"><FaTimes className="close-icon" /></li>}
                            </ul>
                        </div>
                        {/* End Contact Icons Box */}
                    </div>
                    <Footer />
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div >
    );
}