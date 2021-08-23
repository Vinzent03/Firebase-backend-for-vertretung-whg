import { load } from "cheerio";
import * as fetch from "node-fetch";
import { Links } from "./links";
import { dsbMobileData } from "./notification";
export async function fetchData(): Promise<dsbMobileData> {
    const isString = (str: string | undefined): str is string => !!str;

    const responseToday = await fetch.default(Links.substituteLinkToday);
    const responseTomorrow = await fetch.default(Links.substituteLinkTomorrow);

    const htmlToday = await responseToday.text();
    const htmlTomorrow = await responseTomorrow.text();

    const today = load(htmlToday);
    const tomorrow = load(htmlTomorrow);

    const unformattedLastChange = today("h2").text();
    const mainDataToday = today("td").toArray()
        .map((e) => e.children[0]?.data?.trim()).filter(isString);
    const mainDataTomorrow = tomorrow("td").toArray()
        .map((e) => e.children[0]?.data?.trim()).filter(isString);

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