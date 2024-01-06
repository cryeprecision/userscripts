import dayjs from "dayjs";
import { helloWorld } from "../lib";
import _ from "lodash";

console.log(`[Wheregoes] ${helloWorld()}`);
console.log(`[Wheregoes] ${dayjs("2019-01-25").format("DD/MM/YYYY")}`);
console.log(`[Wheregoes] ${$("a").attr("href")}`);
console.log(`[Wheregoes] ${jQuery().jquery} and ${$().jquery}`);
console.log(`[Wheregoes] ${_.partition([1, 2, 3, 4], (n) => n % 2)}`);
