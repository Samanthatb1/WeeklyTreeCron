import axios from 'axios';
import { JSDOM } from 'jsdom';
import fetch from 'cross-fetch';

// Keeps a history of links obtained to save speed
function memoizedData() {
    const organizations_history = {} // {wie : {organization_name: wie, events: []}}

    return async (link) => {
        try {
            const name = link.replace("https://linktr.ee/", "").replace("uwaterloo", "");

            // if we have already visited the link tree
            if (name in organizations_history) {
                return organizations_history[name];
            }
            // if its the first time visiting the link tree
            const organizationData = await getData(link);
            organizations_history[name] = organizationData;
            return organizationData;
        } catch (e) {
            console.log(`Link ${link} isnt a valid link tree`, e)
            // throw new Error(`invalid linktree ${e}`)
        }
    }
}

// Scrapes data given a Link Tree url
async function getData(link) {
    const res = await axios.get(link, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
    });
    const html = await res.data;
    const document = new JSDOM(html).window.document;

    // get name of club
    const name = document.querySelector('h1').innerHTML.trim().replace("@", "").replace("uwaterloo", "");
    const data = {
        "organization_name": name,
        "events": []
    }

    const eventData = document.querySelectorAll('[data-testid="LinkButton"]');
    for (const item of eventData) {
        const eventName = item.textContent.trim();
        const eventLink = item.getAttribute("href");

        if (eventIsUseful(eventName, eventLink)) {
            data.events.push({
                "name": eventName,
                "link": eventLink
            })
        }
    }

    return data
}

const BLOCKED_KEYWORDS = ["discord", "facebook", "instagram", "twitch", "website",
    "nominate", "newsletter", "notion template", "room access",
    "slack", "class profile", "bot pictures", "youtube", "twitter",
    "linkedin", "tech+ website", "documentation", "tiktok", "tik tok",
    "mentor", "mentee", "mailing", "role description", "photos", "resources",
    "exam bank", "feedback", "elections", "email", "medium", "exec",
    "housing", "open roles", "open positions", "youth events", "hiring",
    "photographer application", "become a csc member!", "external cheat sheet",
    "loving remembrance of", "engsoc finance (budget, sponsorship)",
    "mental health guide", "uw campus wellness", "listen to our podcast on spotify",
]

// Removes non important links
function eventIsUseful(name, link) {
    // Early return if the link or name is empty
    if (name === "" || link === "") return false;
    // `.some()` runs the callback function on each element in the array `BLOCKED_KEYWORDS`
    return !BLOCKED_KEYWORDS.some((keyword) => name.toLowerCase().includes(keyword.toLowerCase()));
}

export { memoizedData }
