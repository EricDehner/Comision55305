import chai from "chai";
import supertest from "supertest";
import { ENV_CONFIG } from "../config/config.js"
import { generateMockProduct } from "../mocking/utils.mock.js";

const expect = chai.expect;
const requester = supertest(`http://localhost:${ENV_CONFIG.PORT}`);


describe("Test de E-Commerce", () => {
    let globalCookie = null;
    before(async function () {
        this.mockUser = {
            first_name: "Usuario",
            last_name: "Apellido",
            email: "adminCoder@coder.com",
            age: 30,
            password: "adminCod3r123",
            role: "admin",
            cart: "123Abc",
        };
    });

    describe("Test de usuario.", () => {
        it("Registro usuario - POST /api/sessions/register", async function () {
            const registerResponse = await requester.post("/api/sessions/register").send(this.mockUser);
            
            expect(registerResponse.statusCode).to.equal(200);
        });
        it("Login de usuario y seteo de cookie - POST /api/sessions/login", async function () {
            const loginResponse = await requester.post("/api/sessions/login").send({ email: this.mockUser.email, password: this.mockUser.password });

            expect(loginResponse.statusCode).to.equal(200);
            globalCookie = loginResponse.headers["set-cookie"][0].split(";")[0];
        });
    });

    describe("Test de productos.", () => {
        it("Obtener los productos - GET /api/products", async () => {
            const response = await requester.get("/api/products");
            const { statusCode, ok, _body } = response;

            expect(statusCode).to.be.eql(200);
            expect(ok).to.be.true;
            expect(_body.payload).to.be.an("array");
        });
        it("Cargar producto sin estar logeado - POST /api/products", async function () {
            const productMock = generateMockProduct();
            const { statusCode, ok } = await requester.post("/api/products").send(productMock);

            expect(ok).to.be.not.ok;
            expect(statusCode).to.be.eql(401);
        });
    });

    describe("Test de carts.", () => {
        let createdCartId;

        it("Creación de cart - POST /api/cart/", async () => {
            const createCartResponse = await requester.post("/api/carts");

            expect(createCartResponse.statusCode).to.be.eql(201);
            expect(createCartResponse.body).to.be.an("object");
            createdCartId = createCartResponse.body.id.toString();
        });

        it("Obtener cart por ID - GET /api/carts/:cid", async () => {
            const getCartResponse = await requester.get(`/api/carts/${createdCartId}`);

            expect(getCartResponse.statusCode).to.be.eql(200);
            expect(getCartResponse.body).to.be.an("object");
        });
    });
});
