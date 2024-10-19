/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === "production",
    },
    env: {
        BASE_API_URL: process.env.NODE_ENV === "development" ? "http://localhost:5600" : "https://api.store-with-one-merchant-and-one-currency.com",
        WEBSITE_URL: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://store-with-one-merchant-and-one-currency.com",
        userTokenNameInLocalStorage: "s-w-o-m-a-o-c-u-t",
        languageFieldNameInLocalStorage: "store-with-one-merchant-and-one-currency-language",
        userAddressesFieldNameInLocalStorage: "store-with-one-merchant-and-one-currency-user-addresses",
        currencyName: "EUR",
        storeName: "Store With One Merchant And One Currency Store",
        userCartNameInLocalStorage: "store-with-one-merchant-and-one-currency-customer-cart",
        contactNumber: "4917682295720",
        contactEmail: "info@gmail.com"
    },
    async headers() {
        return [
            {
                source: process.env.NODE_ENV === "development" ? "//localhost:5600/(.*)" : "//api.store-with-one-merchant-and-one-currency.com/(.*)",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    {
                        key: "Access-Control-Allow-Origin",
                        value: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://store-with-one-merchant-and-one-currency.com",
                    },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value:
                            "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
                    },
                ]
            }
        ];
    }
}

module.exports = nextConfig;