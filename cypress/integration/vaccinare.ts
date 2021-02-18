import { isExternalModuleNameRelative } from "typescript"

const username = Cypress.env("username")
const password = Cypress.env("password")

type Center = {
    name: string;
    availableSlots: number;
    localityName: string;
}

describe("vaccinare", () => {
    it("login", () => {
        cy.intercept("https://programare.vaccinare-covid.gov.ro/scheduling/api/centres").as("centersRequest")

        cy.visit("https://programare.vaccinare-covid.gov.ro/");
        cy.get('#mat-input-0').type(username);
        cy.get('#mat-input-1').type(password);
        cy.get('.submit-button').click({ force: true });


        cy.url({timeout: 15000}).should("eq", "https://programare.vaccinare-covid.gov.ro/#/home");

        cy.visit("https://programare.vaccinare-covid.gov.ro/#/appointment/new/2331311");

        cy.wait("@centersRequest", {timeout: 15000}).then((r) => {
            const centers: Center[] = r.response?.body.content.filter((c: Center) => c.availableSlots > 0);
            if (centers.length > 0) {
                let message = `There are available slots at:`;
                centers.forEach(c => {
                    message += `\n${c.name}, ${c.localityName} - ${c.availableSlots} slots`;
                });

                cy.task("log", message);
                cy.task("sendSms", {to: "+40728901566", text: message})
            } else {
                cy.task("log", "There are no centers with available slots.");
            }
        })
    })
})