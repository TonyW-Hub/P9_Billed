/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // Testing all form fields
    test("Then the fields of the form are available", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByText("Envoyer une note de frais"));
      expect(screen.getAllByTestId("expense-type")).toBeTruthy();
      expect(screen.getAllByTestId("expense-name")).toBeTruthy();
      expect(screen.getAllByTestId("datepicker")).toBeTruthy();
      expect(screen.getAllByTestId("amount")).toBeTruthy();
      expect(screen.getAllByTestId("vat")).toBeTruthy();
      expect(screen.getAllByTestId("pct")).toBeTruthy();
      expect(screen.getAllByTestId("commentary")).toBeTruthy();
      expect(screen.getAllByTestId("file")).toBeTruthy();
    });

    describe("When I import file", () => {
      test("Then the upload file", async () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });

        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee", email: "a@a" })
        );

        const html = NewBillUI();

        document.body.innerHTML = html;

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        const selectFile = screen.getByTestId("file");

        selectFile.addEventListener("change", handleChangeFile);

        fireEvent.change(selectFile, {
          target: {
            files: [
              new File(["image"], "image.png", {
                type: "image/png",
              }),
            ],
          },
        });

        expect(handleChangeFile).toHaveBeenCalled();
      });

      test("Then upload file with bad format", async () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });

        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee", email: "a@a" })
        );

        const html = NewBillUI();

        document.body.innerHTML = html;

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const handleChangeFile = jest.fn((e) => {
          console.log(e);
          newBill.handleChangeFile(e);
        });
        const selectFile = screen.getByTestId("file");

        selectFile.addEventListener("change", handleChangeFile);

        fireEvent.change(selectFile, {
          target: { files: [new File(["text"], "text.txt", { type: "text" })] },
        });
        expect(handleChangeFile).toHaveBeenCalled();
      });
    });

    describe("When I Submit form", () => {
      test("Then, I should be redirect on Bills page", () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const html = NewBillUI();
        document.body.innerHTML = html;

        const newBills = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const handleSubmit = jest.fn(newBills.handleSubmit);
        const newBillForm = screen.getByTestId("form-new-bill");

        newBillForm.addEventListener("submit", handleSubmit);

        fireEvent.submit(newBillForm);

        expect(handleSubmit).toHaveBeenCalled();
        expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
      });

      describe("When an error occurs on API", () => {
        beforeEach(() => {
          jest.spyOn(mockStore, "bills");
          Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
          });
          window.localStorage.setItem(
            "user",
            JSON.stringify({
              type: "Employee",
              email: "a@a",
            })
          );
          const root = document.createElement("div");
          root.setAttribute("id", "root");
          document.body.appendChild(root);
          router();
        });

        test("Then fetch bills from an API and return 404 message error", async () => {
          mockStore.bills.mockImplementationOnce(() =>
            Promise.reject(new Error("Erreur 404"))
          );
          const html = BillsUI({ error: "Erreur 404" });
          document.body.innerHTML = html;
          const message = screen.getByText(/Erreur 404/);
          expect(message).toBeTruthy();
        });

        test("Then fetch messages from an API and return 500 message error", async () => {
          mockStore.bills.mockImplementationOnce(() =>
            Promise.reject(new Error("Erreur 500"))
          );
          const html = BillsUI({ error: "Erreur 500" });
          document.body.innerHTML = html;
          const message = screen.getByText(/Erreur 500/);
          expect(message).toBeTruthy();
        });
      });
    });
  });
});
