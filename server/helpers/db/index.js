// import _ from "lodash";
// import OfficeType from "../../models/officeType";
// import Activity from "../../models/activity";
// import { AdvocateExist } from "./advocate";

// const isValidOfficeType = async id => {
//   const foundData = await OfficeType.findById(id);
//   console.log(foundData);
//   return true;
// };

// const addActivity = async activityObj => {
//   await new Activity(activityObj)
//     .save()
//     .then(() => console.log("done"))
//     .catch(err => console.log("ERR :: ", err));
// };

// export default {
//   isValidOfficeType,
//   AdvocateExist,
//   addActivity,
// };
