import axios from "axios";

export async function justdialApi(sessionData, page = 1) {
  const {
    city,
    category: search,
    jdlt,
    search_id,
    nextdocid,
    national_catid,
    cookies = [],
    mncatname,
  } = sessionData;

  console.log("👉 Using sessionData:", {
    city,
    search,
    jdlt,
    search_id,
    nextdocid,
    national_catid,
    mncatname,
  });

  if (!jdlt || !search_id || !nextdocid || !national_catid) {
    throw new Error("❌ Missing required session values.");
  }

  const cookieHeader =
    cookies.length > 0
      ? cookies.map((c) => `${c.name}=${c.value}`).join("; ")
      : "";

  const headers = {
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0.0.0 Safari/537.36",
    Origin: "https://www.justdial.com",
    Referer: `https://www.justdial.com/${city}/${search}`,
    jdlt,
    Cookie: cookieHeader,
  };

  console.log("cookie", cookieHeader);

  const body = {
    median_latitude: "",
    median_longitude: "",
    city,
    search,
    area: "",
    lat: "",
    long: "",
    national_catid,
    nextdocid,
    stype: "category_list",
    opt: "",
    pg_no: page,
    nearme: "0",
    checkin: 1752624000,
    checkout: 1752710400,
    attribute_values: "",
    mncatname,
    darea_flg: 0,
    bid: 0,
    pdid: [],
    trkid: "",
    version: "3.0",
    search_id,
    attr: "",
    chainotlt: 0,
    asnm: 0,
    selectedImage: "",
    jdlt,
  };

  try {
    const res = await axios.post(
      "https://www.justdial.com/api/resultsPageListing",
      body,
      {
        headers,
        // maxRedirects: 0,
        // validateStatus: (status) => status < 400 || status === 302,
      }
    );
    console.log("response", res);

    const raw = res.data?.searchListing;

    if (!raw || !Array.isArray(raw)) {
      console.warn("⚠️ Unexpected response:", res.data);
      return [];
    }

    if (res.status === 302) {
      console.error("Got 302 redirect:", res.headers.location);
      console.error("Cookies:", headers.Cookie);
      console.error("jdlt:", headers.jdlt);
      return [];
    }

    const contacts = raw.map((item) => ({
      name: item?.title || null,
      phone: item?.contacts?.[0]?.contact || null,
      email: item?.contacts?.[0]?.email || null,
      address: item?.address || null,
      rating: item?.avg_rating || null,
      verified: item?.jd_verified_flag === "1",
    }));

    return contacts;
  } catch (error) {
    console.error("Failed to fetch data from JD API:", error.message);
    return [];
  }
}
