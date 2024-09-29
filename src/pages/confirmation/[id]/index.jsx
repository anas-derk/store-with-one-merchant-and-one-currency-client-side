import Head from "next/head";
import Header from "@/components/Header";
import LoaderPage from "@/components/LoaderPage";
import { useState, useEffect } from "react";
import axios from "axios";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { FaRegSmileWink } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import { getUserInfo, handleSelectUserLanguage } from "../../../../public/global_functions/popular";
import NotFoundError from "@/components/NotFoundError";
import StoreLogo from "../../../../public/images/storeLogo.png";

export default function Confirmation({ orderIdAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [isGetUserInfo, setIsGetUserInfo] = useState(true);

    const [isGetOrderDetails, setIsGetOrderDetails] = useState(true);

    const [orderDetails, setOrderDetails] = useState({});

    const [pricesDetailsSummary, setPricesDetailsSummary] = useState({
        totalPriceBeforeDiscount: 0,
        totalDiscount: 0,
        totalPriceAfterDiscount: 0
    });

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.languageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
        if (userToken) {
            getUserInfo()
                .then((result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                    }
                    setIsGetUserInfo(false);
                })
                .catch((err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        setIsGetUserInfo(false);
                    }
                    else {
                        setIsLoadingPage(false);
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                    }
                });
        } else {
            setIsLoadingPage(false);
        }
    }, []);

    useEffect(() => {
        getOrderDetails(orderIdAsProperty)
            .then(async (res) => {
                let result = res.data;
                if (!res.error) {
                    setOrderDetails(result);
                    const tempTotalPriceBeforeDiscount = calcTotalOrderPriceBeforeDiscount(result.products);
                    const tempTotalDiscount = calcTotalOrderDiscount(result.products);
                    setPricesDetailsSummary({
                        totalPriceBeforeDiscount: tempTotalPriceBeforeDiscount,
                        totalDiscount: tempTotalDiscount,
                        totalPriceAfterDiscount: tempTotalPriceBeforeDiscount - tempTotalDiscount
                    });
                    setIsGetOrderDetails(false);
                }
            })
            .catch((err) => {
                setIsLoadingPage(false);
                setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
            });
    }, [orderIdAsProperty]);

    useEffect(() => {
        if (!isGetOrderDetails && !isGetUserInfo) {
            setIsLoadingPage(false);
        }
    }, [isGetOrderDetails, isGetUserInfo]);

    const getOrderDetails = async (orderId) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/orders/order-details/${orderId}`)).data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const calcTotalOrderPriceBeforeDiscount = (allProductsData) => {
        let tempTotalPriceBeforeDiscount = 0;
        allProductsData.forEach((product) => {
            tempTotalPriceBeforeDiscount += product.unitPrice * product.quantity;
        });
        return tempTotalPriceBeforeDiscount;
    }

    const calcTotalOrderDiscount = (allProductsData) => {
        let tempTotalDiscount = 0;
        allProductsData.forEach((product) => {
            tempTotalDiscount += product.discount * product.quantity;
        });
        return tempTotalDiscount;
    }

    return (
        <div className="confirmation">
            <Head>
                <title>{t(process.env.storeName)} - {t("Payment Confirmation")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content page pt-5">
                    <div className="container-fluid align-items-center pb-4 text-white">
                        <h1 className="welcome-msg text-center mb-5 h4">{t("Welcome To You In Payment Confirmation Page")}</h1>
                        {Object.keys(orderDetails).length > 0 ? <section className="order-total border border-3 p-4 ps-md-5 pe-md-5 text-center" id="order-total">
                            <h5 className="fw-bold mb-4 text-center">{t("Your Request")}</h5>
                            <div className="order-id-and-number border border-white border-2 p-4 mb-5">
                                <h5 className="mb-4 text-center">{t("Order Id")} : {orderDetails._id}</h5>
                                <h5 className="m-0 text-center">{t("Order Number")} : {orderDetails.orderNumber}</h5>
                            </div>
                            <h5 className="mb-5 text-center border border-white border-2 p-4">{t("Order Details")}</h5>
                            <div className="row total pb-3 mb-5">
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Product Name And Quantity")}
                                </div>
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Unit Price Before Discount")}
                                </div>
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Unit Discount")}
                                </div>
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Sum")}
                                </div>
                            </div>
                            {orderDetails.products.map((product, productIndex) => (
                                <div className="row total pb-3 mb-5" key={productIndex}>
                                    <div className="col-md-3 fw-bold p-0">
                                        {i18n.language !== "ar" ? <span>
                                            ( {product.name} ) x {product.quantity}
                                        </span> : <span>
                                            ( {product.name} ) {product.quantity}
                                        </span>}
                                    </div>
                                    <div className="col-md-3 fw-bold p-0">
                                        {product.unitPrice.toFixed(2)} {t("EUR")}
                                    </div>
                                    <div className="col-md-3 fw-bold p-0">
                                        {product.discount.toFixed(2)} {t("EUR")}
                                    </div>
                                    <div className="col-md-3 fw-bold p-0">
                                        {((product.unitPrice - product.discount) * product.quantity).toFixed(2)} {t("EUR")}
                                    </div>
                                </div>
                            ))}
                            <div className="row total-price-before-discount total pb-3 mb-5">
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Total Price Before Discount")}
                                </div>
                                <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                    {(pricesDetailsSummary.totalPriceBeforeDiscount).toFixed(2)} {t("EUR")}
                                </div>
                            </div>
                            <div className="row total-price-discount total pb-3 mb-5">
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Total Discount")}
                                </div>
                                <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                    {(pricesDetailsSummary.totalDiscount).toFixed(2)} {t("EUR")}
                                </div>
                            </div>
                            <div className="row total-price-after-discount total pb-3 mb-5">
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Total Price After Discount")}
                                </div>
                                <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                    {(pricesDetailsSummary.totalPriceAfterDiscount).toFixed(2)} {t("EUR")}
                                </div>
                            </div>
                            <div className="thanks-icon-box mb-4">
                                <FaRegSmileWink className="thanks-icon" style={{ fontSize: "70px" }} />
                            </div>
                            <h4 className="mb-4">
                                {t("Thanks For Purchase From Store")} : ....
                            </h4>
                            <img
                                src={StoreLogo.src}
                                alt="... Store Logo"
                                className="store-image"
                            />
                        </section>: <NotFoundError errorMsg={t("Sorry, This Order Is Not Found !!")} />}
                    </div>
                    <Footer />
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}

export async function getServerSideProps({ query, params }) {
    if (!params.id) {
        return {
            redirect: {
                permanent: false,
                destination: "/",
            },
            props: {},
        }
    }
    if (Object.keys(query).filter((key) => key !== "id").length > 1) {
        return {
            redirect: {
                permanent: false,
                destination: `/confirmation/${params.id}`,
            },
            props: {
                orderIdAsProperty: params.id,
            },
        }
    }
    return {
        props: {
            orderIdAsProperty: params.id,
        },
    }
}