import { event, auth } from "tealium";

var eventDataUdo = event.data.udo;
var eventDataDom = event.data.dom;
var eventType = "";


var getQuantity = function(i){
var productQuantity = 1
if (eventDataUdo.product_quantity) {
    productQuantity = parseInt(eventDataUdo.product_quantity[i])
    }
    return productQuantity;
}


var productDetails = [];

if (eventDataUdo.product_id && typeof eventDataUdo.product_id === "object" && eventDataUdo.product_id.length > -1) {
    for (let i = 0; i < eventDataUdo.product_id.length; i++) {
        productDetails.push({
            product: {
                name: eventDataUdo.product_name[i],
                id: eventDataUdo.product_id[i],
                type: "TYPE_UNSPECIFIED",
                primaryProductId: eventDataUdo.product_id[i],
                categories: eventDataUdo.product_category,
                title: eventDataUdo.product_name[i],
                brands: eventDataUdo.product_brand,
                description: event.data.meta.description,
                priceInfo: {
                    currencyCode: eventDataUdo.site_currency,
                    price: parseInt(eventDataUdo.product_price[i]),
                    originalPrice: parseInt(eventDataUdo.product_original_price[i]),
                }
            },
            quantity: getQuantity(i),
        });
    }
}else{
    productDetails.push({
        product: {
            name: eventDataUdo.product_name,
            id: eventDataUdo.product_id,
            type: "TYPE_UNSPECIFIED",
            primaryProductId: eventDataUdo.product_id,
            categories: eventDataUdo.product_category,
            title: eventDataUdo.product_name,
            brands: eventDataUdo.product_brand,
            description: event.data.meta.description,
            priceInfo: {
                currencyCode: eventDataUdo.site_currency,
                price: parseInt(eventDataUdo.product_price),
                originalPrice: parseInt(eventDataUdo.product_original_price)
            },
        },
        quantity: parseInt(eventDataUdo.product_quantity) || 1,
    });
}

var purchaseTransaction = {};

if (eventDataUdo.order_id) {
    purchaseTransaction = {
        id: eventDataUdo.order_id,
        revenue: parseInt(eventDataUdo.order_total),
        tax: parseInt(eventDataUdo.order_tax),
        cost: parseInt(eventDataUdo.order_total) - parseInt(eventDataUdo.order_tax) - parseInt(eventDataUdo.order_shipping),
        currencyCode: eventDataUdo.order_currency,
    };
}

var userInfo = {
    userId: eventDataUdo.customer_email,
    ipAddress: "8.8.8.8",
    userAgent: event.useragent,
    directUserRequest: true,
};



switch (eventDataUdo.tealium_event) {
    case "category_view":
        eventType = "category-page-view";
        break;
    case "product_view":
        eventType = "detail-page-view";
        break;
    case "add_to_cart":
        eventType = "add-to-cart";
        break;
    case "shopping_cart_view":
        eventType = "shopping-cart-page-view";
        break;
    case "purchase":
        eventType = "purchase-complete";
        break;
    default:
        console.log("Unknown event: " + eventType);
}

var eventPayload = {
        eventType: eventType,
        visitorId: event.visitor_id,
        sessionId: eventDataUdo.tealium_session_id,
        eventTime: eventDataUdo.tealium_timestamp_utc,
        productDetails: productDetails,
        purchaseTransaction: purchaseTransaction,
        userInfo: userInfo,
        uri: eventDataDom.url,
        referrerUri: eventDataDom.referrer
};

if (typeof eventType !== "undefined" && eventType !== "") {
    var finalEventPayload = eventPayload;
    console.log(JSON.stringify(finalEventPayload));
}

fetch("" // Insert the URL of your Cloud Function here 
    ,{ 
    method: "POST",
    body: JSON.stringify(finalEventPayload),
    headers: {
        "Content-Type": "application/json; charset=utf-8"
    },
})
    .then((response) => {
        if (!response.ok) {
            throw new Error("Network response was not ok. Status code: " + JSON.stringify(response));
        }
        return response.json();
    })
    .then((data) => console.log("Response:", JSON.stringify(data)))
    .catch((error) => console.log("Error:", error.message));
