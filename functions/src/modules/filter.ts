export function checker(schoolClass: string, substitute: string[], subjects: string[], subjectsNot: string[], personalSubstitute: boolean) {
    //filter the given schoolClass
    var listWithoutClasses: string[] = [];
    var b = 0;
    schoolClass = schoolClass.toLowerCase();
    substitute.forEach(part => {
        var stk = part.toLowerCase();
        if (stk.includes("std.")) {
            if (b === 1) {
                listWithoutClasses.push(part);
            }
        } else {
            if (stk.includes(schoolClass)) {
                b = 1;
            } else {
                b = 2;
            }
        }
    });

    if (personalSubstitute) {
        return format(checkSubject(listWithoutClasses, subjects, subjectsNot));
    } else {
        return format(listWithoutClasses);
    }
}
function format(list: string[]) {
    var betterList: string[] = [];
    list.forEach(st => {
        if (st.includes("bei +")) {
            var beginn = st.substring(0, st.indexOf("bei +") - 1);
            st = beginn + " Entfall";
        }
        betterList.push(st);
    });
    return betterList;
}

function checkSubject(listWithoutClasses: string[], subjects: string[], subjectsNot: string[]) {

    var listWithoutLessons: string[] = [];
    if (subjects.length === 0 || (subjects[0] === "")) {
        subjects = [""];
    }
    if (subjectsNot.length === 0 || (subjectsNot[0] === "")) {
        subjectsNot = ["lsjdf"];
    }

    if (listWithoutClasses.length > 0) {
        listWithoutClasses.forEach(st => {
            let stLower = st.toLowerCase();
            subjects.forEach(subject => {
                subject = subject.toLowerCase();
                if (subject !== "")
                    subject = " " + subject + " ";
                var i = 0;
                subjectsNot.forEach(subjectNot => {
                    subjectNot = subjectNot.toLowerCase();
                    subjectNot = " " + subjectNot + " ";

                    if (stLower.includes("bei")) {
                        stLower = stLower.substring(0, stLower.indexOf("bei"));
                    }
                    if (stLower.includes(subject)) {
                        if (i !== 2) {
                            i = 1;
                        }
                        if (stLower.includes(subjectNot)) {
                            i = 2;
                        }
                    }
                });
                if (i === 1) {
                    listWithoutLessons.push(st);
                }
            });
        });
    }
    return listWithoutLessons;
}