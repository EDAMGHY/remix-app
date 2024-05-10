import { json, redirect } from "@remix-run/node";
import {
  Form,
  Links,
  LiveReload,
  NavLink,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useSubmit,
  useNavigation,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { createEmptyContact, getContacts } from "./data";
import { useEffect } from "react";

import appStylesHref from "./app.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
};

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

export default function App() {
  const navigation = useNavigation();
  const { contacts, q } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <div id='sidebar'>
          <h1>Remix Contacts</h1>
          <div>
            <Form
              onChange={(event) => {
                const isFirstSearch = q === null;
                submit(event.currentTarget, {
                  replace: !isFirstSearch,
                });
              }}
              id='search-form'
              role='search'
            >
              <input
                id='q'
                className={searching ? "loading" : ""}
                aria-label='Search contacts'
                placeholder='Search'
                type='search'
                defaultValue={q || ""}
                name='q'
              />
              <div id='search-spinner' hidden={!searching} aria-hidden />
            </Form>
            <Form method='post'>
              <button type='submit'>New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? "active" : isPending ? "pending" : ""
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}
                      {contact.favorite ? <span>★</span> : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div
          className={
            navigation.state === "loading" && !searching ? "loading" : ""
          }
          id='detail'
        >
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
