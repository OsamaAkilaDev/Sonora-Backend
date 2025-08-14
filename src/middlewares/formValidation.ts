import { Request, Response } from "express";

export function validateUsername(req: Request, res: Response, next: () => any) {
  const username: string = req.body.username;

  let errors: string[] = [];

  // Check if its empty
  if (!username) errors.push("Empty username");

  // Check character limit
  if (username.length < 3) errors.push("3 characters minimum");

  if (username.length > 50) errors.push("50 characters maximum");

  // Check if its composed of letters, numbers, underscore (_), hyphen (-), and dot (.)
  if (!/^[A-Za-z0-9_.-]+$/.test(username)) errors.push("A-Z 0-9 _ - . only");

  // Check if it does not start with (-) or (.)
  if (/^[-.]/.test(username)) errors.push("Can't  start with - or .");

  // Assign errors to request body
  if (errors.length > 0) {
    if (!req.body.errors) req.body.errors = {};
    req.body.errors.username = errors;
  }

  next();
}

export function validateDisplayName(
  req: Request,
  res: Response,
  next: () => any
) {
  const displayName: string = req.body.displayName;

  let errors: string[] = [];

  // Check if its empty
  if (!displayName) errors.push("Empty display name");

  // Check character limit
  if (displayName.length < 3) errors.push("3 characters minimum");

  if (displayName.length > 50) errors.push("50 characters maximum");

  // Check if it contains unallowed special characters < > { } [ ] / \ ; : " ' , @ ? `
  if (/[<>[\]{}\/\\;:"',@?`]/.test(displayName)) errors.push("Illegal symbols");

  // Assign errors to request body
  if (errors.length > 0) {
    if (!req.body.errors) req.body.errors = {};
    req.body.errors.displayName = errors;
  }

  next();
}

export function validateEmail(req: Request, res: Response, next: () => any) {
  let errors: string[] = [];

  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(req.body.email))
    errors.push("Invalid Email");

  // Assign errors to request body
  if (errors.length > 0) {
    if (!req.body.errors) req.body.errors = {};
    req.body.errors.email = errors;
  }

  next();
}

export function validatePassword(req: Request, res: Response, next: () => any) {
  const password: string = req.body.password;
  const passwordConfirmed: string = req.body.passwordConfirmed;

  let errors: string[] = [];
  let passwordConfirmedErrors = [];

  function addPasswordError(error: string) {
    req.body.errors.password = [...req.body.errors?.password, error];
  }

  if (password.length < 8) errors.push("8 characters minimum");

  if (password.length > 50) errors.push("50 characters maximum");

  if (password != passwordConfirmed)
    passwordConfirmedErrors.push("Passwords do not match.");

  // Assign errors to request body
  if (errors.length > 0) {
    if (!req.body.errors) req.body.errors = {};
    req.body.errors.password = errors;
  }

  if (passwordConfirmedErrors.length > 0) {
    if (!req.body.errors) req.body.errors = {};
    req.body.errors.passwordConfirmed = passwordConfirmedErrors;
  }

  next();
}
