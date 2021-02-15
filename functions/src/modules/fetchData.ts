import { load } from "cheerio";
import * as fetch from "node-fetch";
import { dsbMobileData } from "./notification";
export async function fetchData(): Promise<dsbMobileData> {
    const isString = (str: string | undefined): str is string => !!str;


    const urlToday = "https://app.dsbcontrol.de/data/15fddc3b-5b2e-4339-847b-66d2e291b04a/ebfdb6c0-e2c4-4da1-ab90-ffc51b684903/ebfdb6c0-e2c4-4da1-ab90-ffc51b684903.html";
    const urlTomorrow = "https://app.dsbcontrol.de/data/15fddc3b-5b2e-4339-847b-66d2e291b04a/12dcaead-309b-4fc6-904e-5e0bfc1f20b3/12dcaead-309b-4fc6-904e-5e0bfc1f20b3.html";

    const responseToday = await fetch.default(urlToday);
    const responseTomorrow = await fetch.default(urlTomorrow);


    const htmlToday = await responseToday.text();
    const htmlTomorrow = await responseTomorrow.text();

    const today = load(htmlToday);
    const tomorrow = load(htmlTomorrow);

    const unformattedLastChange = today("h2").text();
    const mainDataToday = today("td").toArray()
        .map((e) => e.children[0]?.data).filter(isString);
    const mainDataTomorrow = tomorrow("td").toArray()
        .map((e) => e.children[0]?.data).filter(isString);

    return {
        lastChange: formatLastChange(unformattedLastChange),
        dayNames: getDayNames(today, tomorrow),
        mainDataToday: mainDataToday,
        mainDataTomorrow: mainDataTomorrow,
    };
}
function formatLastChange(unformattedLastChange: string) {
    const lastChangeShort = unformattedLastChange.substring(17);
    const lastChangeFinal =
        lastChangeShort.replace(lastChangeShort.substring(6, 10), "");
    return lastChangeFinal;

}
function getDayNames(today: CheerioStatic, tomorrow: CheerioStatic) {
    let dayNameToday = today(".dayHeader").text();
    let dayNameTomorrow = tomorrow(".dayHeader").text();

    if (!dayNameToday) {
        dayNameToday = today("legend").text();
    }
    if (!dayNameTomorrow) {
        dayNameTomorrow = tomorrow("legend").text();
    }
    const dayNames = [dayNameToday, dayNameTomorrow];
    return dayNames.map((e) => e.substring(e.indexOf(",") + 2));
}