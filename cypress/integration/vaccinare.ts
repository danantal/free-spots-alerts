
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

        cy.visit("https://programare.vaccinare-covid.gov.ro/#/recipients");
        cy.visit("https://programare.vaccinare-covid.gov.ro/#/planning/recipient/2331311");

        cy.wait("@centersRequest", {timeout: 15000}).then((r) => {
            const center: Center = r.response?.body.content.find((c: Center) => c.availableSlots > 0);
            if (center) {
                cy.task("log", `There are ${center.availableSlots} available slots at ${center.name}, ${center.localityName}`);
                cy.task("sendSms", {to: "+40728901566", text: `There are ${center.availableSlots} available slots at ${center.name}, ${center.localityName}`})
            } else {
                cy.task("log", "There are no centers with available slots.");
            }
        })
    })
})