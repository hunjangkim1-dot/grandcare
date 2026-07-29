// shared/api.js

const db = window.supabaseClient;

/**
 * 전체 조회
 */
export async function getAll(table) {

    const { data, error } = await db
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data;

}

/**
 * 단건 조회
 */
export async function getById(table, id) {

    const { data, error } = await db
        .from(table)
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;

    return data;

}

/**
 * 등록
 */
export async function insert(table, payload) {

    const { data, error } = await db
        .from(table)
        .insert(payload)
        .select()
        .single();

    if (error) throw error;

    return data;

}

/**
 * 수정
 */
export async function update(table, id, payload) {

    const { data, error } = await db
        .from(table)
        .update(payload)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    return data;

}

/**
 * 삭제
 */
export async function remove(table, id) {

    const { error } = await db
        .from(table)
        .delete()
        .eq("id", id);

    if (error) throw error;

}