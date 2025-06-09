export const getCurrentCycle = (comapany) => {
    const subscribeData = comapany.subscription.createdAt

    // // Calculate the start date of the current month's payment period
    // const subscriptionData = new Date(subscribeData);
    // console.log("subscriptionData :  : ", subscriptionData);

    // const paymentDate = subscriptionData.getDate() > 28
    //     ? subscriptionData.getMonth() === 1 ? 28 : 30
    //     : subscriptionData.getDate();

    // const currentMonth = new Date();
    // currentMonth.setDate(paymentDate - 1);
    // console.log("currentMonth : ", currentMonth);

    // const nextMonth = new Date();
    // nextMonth.setDate(paymentDate + 1);
    // nextMonth.setMonth(nextMonth.getMonth() + 1);

    // // Calculate the end date of the current month's payment period
    // // Calculate the start date of the next month
    // const startDate = currentMonth;
    // console.log("startDate : ", startDate);

    // // Calculate the end date of the next month
    // const endDate = nextMonth;
    // console.log("endDate : ", endDate);
    // return {
    //     startDate,
    //     endDate
    // }

    var subscriptionStartDate = new Date(subscribeData);
    console.log("subscriptionStartDate : ", subscriptionStartDate);

    var currentDate = new Date();
    console.log("currentDate : ", currentDate);

    var timeDiff = currentDate.getTime() - subscriptionStartDate.getTime();

    // Calculate the difference in months
    var monthsDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30.44)); // Approximate average days in a month

    console.log("monthsDiff : ", monthsDiff);

    // Calculate the start date and end date of the current month's service period
    var currentMonthStartDate = new Date(subscriptionStartDate);
    currentMonthStartDate.setMonth(subscriptionStartDate.getMonth() + monthsDiff);

    console.log("currentMonthStartDate : ", currentMonthStartDate)

    var currentMonthEndDate = new Date(currentMonthStartDate);
    currentMonthEndDate.setMonth(currentMonthStartDate.getMonth() + 1);
    currentMonthEndDate.setDate(currentMonthEndDate.getDate() - 1);

    console.log("currentMonthEndDate : ", currentMonthEndDate);

    return {
        startDate: currentMonthStartDate,
        endDate: currentMonthEndDate,
        months: monthsDiff
    }
}