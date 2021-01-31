
const username = Cypress.env("username")
const password = Cypress.env("password")

describe("vaccinare", () => {
    it("login", () => {
        cy.intercept("https://programare.vaccinare-covid.gov.ro/scheduling/api/centres").as("centersRequest")

        cy.visit("https://programare.vaccinare-covid.gov.ro/");
        cy.get('#mat-input-0').type(username);
        cy.get('#mat-input-1').type(password);
        cy.get('.submit-button').click({ force: true });
        cy.visit("https://programare.vaccinare-covid.gov.ro/#/recipients");
        cy.visit("https://programare.vaccinare-covid.gov.ro/#/planning/recipient/2331311");

        cy.wait("@centersRequest").then((r) => {
            const center = r.response?.body.content.find((c: {availableSlots: number}) => c.availableSlots > 0);
            if (center) {
                cy.task("log", "center found", center);
                cy.task("sendSms", {to: "+40728901566", text: `There are available slots: ${center.availableSlots}`})
            } else {
                cy.task("log", "no center available");
            }
        })
    })
})