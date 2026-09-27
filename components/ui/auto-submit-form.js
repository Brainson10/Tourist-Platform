"use client";

/** A GET form that re-submits whenever a select changes. Works as a plain form without JS. */
export function AutoSubmitForm({ children, ...props }) {
  return (
    <form
      {...props}
      onChange={(event) => {
        if (event.target.tagName === "SELECT") event.currentTarget.requestSubmit();
      }}
    >
      {children}
    </form>
  );
}
