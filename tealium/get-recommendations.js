import { event, tealium } from "tealium";

(async () => {
    let testJson = {
        traceId: event.data.firstparty_tealium_cookies.trace_id || '',
        userEvent: {
            eventType: "detail-page-view",
            visitorId: event.visitor_id,
            userInfo: {
                userId: event.data.udo.customer_email,
                ipAddress: "8.8.8.8",
                userAgent: event.useragent,
            },
            productDetails: [
                {
                    product: {
                        id: event.data.udo.product_id[0],
                    },
                },
            ],
        },
    };

    var logData = function (data) {
        var productArray = data.results;
        var productIdList = [];
        for (var i = 0; i < productArray.length; i++) {
            productIdList.push(productArray[i].id);
        }
        var newEvent = {
            "product_id_list": productIdList,
            "tealium_event": "predict",
            "tealium_visitor_id": event.visitor_id,
            "tealium_trace_id": event.data.firstparty_tealium_cookies.trace_id || ''
            };

        console.log(JSON.stringify(newEvent))
    };

    fetch("" // Insert the URL of your Cloud Function here 
        , {
            method: "POST",
            body: JSON.stringify(testJson),
            headers: {
                "Content-Type": "application/json; charset=utf-8",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok. Status code: " + JSON.stringify(response));
            }
            return response.json();
        })
        .then((data) => logData(data))
        .catch((error) => console.log("Error:", error.message));
})();
