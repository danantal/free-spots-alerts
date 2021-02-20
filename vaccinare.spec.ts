import { chromium } from "playwright"
import createClient from 'twilio';
import { program } from "commander";

program
    .option('--username <value>', 'The username')
    .option('--password <value>', 'The password')
    .option('--authToken <value>', 'The Twilio authentication token')
    .option('--headless', 'Run the script headless', false)
    .parse();

const params = program.opts();


const username = params.username;
const password = params.password;
const accountSid = "AC367e8b66199baf01b3098f074b2662aa";
const messagingServiceSid = "MG2c3c0a01ad03065276dfdef78b8c4a9d";
const authToken = params.authToken;

type Center = {
    name: string;
    availableSlots: number;
    localityName: string;
}

(async () => {
    const browser = await chromium.launch({
        headless: params.headless,
        logger: {
            isEnabled: () => true,
            log: (name, severity, message, args) => {
                if (severity != "info") {
                    console.log(`${name}, severity: ${severity}, message: ${message}`, args)
                }
            }
        }
    });

    try {
        const page = await browser.newPage();
        await page.goto("https://programare.vaccinare-covid.gov.ro/")

        await page.fill('input[name="username"]', username);
        await page.fill('input[name="password"]', password);
        await page.click('button.submit-button');

        await page.waitForNavigation({ url: "https://programare.vaccinare-covid.gov.ro/#/home" })

        await page.goto("https://programare.vaccinare-covid.gov.ro/#/appointment/new/2331311")


        const response = await page.waitForResponse('**/scheduling/api/centres?page=0&size=10&sort=,*');
        const body: any = await response.json();
        const centers: Center[] = body.content;
        const availableCenters = centers.filter(el => el.availableSlots > 0);

        let message = "";
        if (availableCenters.length === 0) {
            message = "There are no available slots at any center";
        }
        else {
            message = "There are available slots at:";
            availableCenters.forEach(element => {
                message += `\n${element.name}, ${element.localityName} has ${element.availableSlots} slots available`;
            });
            await sendSms({ to: "+40728901566", message });
        }

        console.log(message);
    }
    catch (error) {
        console.error(error)
    }
    finally {
        await browser.close();
    }
})();


const sendSms = async ({ to, message }: { to: string, message: string }) => {
    const client = createClient(accountSid, authToken)

    console.log(`sending message to '${to}' with text: ${message}`)
    const sms = await client.messages.create({
        to,
        messagingServiceSid,
        body: message
    });

    console.log("message sid", sms.sid)
}