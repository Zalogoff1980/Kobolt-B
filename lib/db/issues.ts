"use client";

import { Issue, createIssue } from "@/lib/content/issue";
import { dbPut, dbGet, dbGetAll, dbDelete } from "./indexedDb";

/** Публичный API работы с выпусками. Компоненты не должны напрямую
 *  трогать indexedDb.ts — только через эти функции, чтобы место, где
 *  выпуск сериализуется в PDF-экспорт (шаг 5), было единственным. */

export async function saveNewIssue(params: { number: string; date: string }): Promise<Issue> {
  const issue = createIssue(params);
  await dbPut(issue);
  return issue;
}

export async function updateIssue(issue: Issue): Promise<void> {
  await dbPut({ ...issue, updatedAt: new Date().toISOString() });
}

export async function getIssue(id: string): Promise<Issue | undefined> {
  return dbGet<Issue>(id);
}

export async function listIssues(): Promise<Issue[]> {
  const issues = await dbGetAll<Issue>();
  return issues.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteIssue(id: string): Promise<void> {
  await dbDelete(id);
}
