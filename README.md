<h1 align="center">Web2APK Template</h1>

<p align="center">
  <img alt="Android" src="https://img.shields.io/badge/Android-APK-3DDC84?logo=android&logoColor=white">
  <img alt="GitHub Actions" src="https://img.shields.io/badge/GitHub-Actions-2088FF?logo=githubactions&logoColor=white">
  <img alt="Capacitor" src="https://img.shields.io/badge/Built%20with-Capacitor-119EFF?logo=capacitor&logoColor=white">
  <img alt="No local setup" src="https://img.shields.io/badge/Setup-none-ff8a1f">
</p>

<p align="center"><b>Turn a website into an Android APK from your phone.</b><br>
No computer, no Android Studio, no file editing. Use the template, fill one form, download the APK.</p>

---

## Build from your phone

1. Press **Use this template** at the top of this page, then **Create a new repository**.
2. Open your new repository and go to the **Actions** tab. If GitHub asks, press the green button to enable workflows.
3. Pick **Build APK** in the list on the left and press **Run workflow**.
4. Fill the form (every field is optional, see the table below) and press the green **Run workflow** button.
5. Wait a few minutes. When the run turns green, open it and download the APK under **Artifacts**.
6. Unzip the download and install the `.apk` on your phone.

> [!TIP]
> Your phone may ask you to allow installs from your browser or file manager the first time.

## The form

| Field | What to type | Example |
|-------|--------------|---------|
| `appName` | Name shown under the app icon | `My Shop` |
| `appId` | Unique package id, new for every app (letters, digits, `_`, at least two parts) | `com.me.shop` |
| `url` | Website the app loads | `https://my-shop.com` |
| `versionName` | Version shown to users (letters, digits, `. + _ -`) | `1.0.0` |
| `versionCode` | Whole number, must grow with every release | `2` |
| `iconUrl` | Direct `https` link to a square PNG icon | `https://example.com/icon.png` |

**Empty field = ignored.** Order of values: **form field, then `.github/app.json`, then Web2APK defaults.** You only type what you want to change.

## No website URL?

Put your site files (`index.html` and friends) in the **`public`** folder. They are bundled inside the APK whenever `url` is empty.

## Save your settings (optional)

Do not want to retype the form every time? Edit these files in your repository (the GitHub mobile website can edit files too):

- `.github/app.json` holds your app name, id, version, colours, permissions and more.
- `.github/icon.png` is your app icon. A square PNG, 1024 x 1024 recommended.

The form still wins over these files whenever you fill a field.

## Updating your app later

1. Run **Build APK** again.
2. Type a **bigger** `versionCode` than last time (for example `2`, then `3`) and a new `versionName`.
3. Keep the same `appId`, otherwise Android treats it as a different app.

## Fixed signing key (optional)

By default a temporary key is generated on every build. That APK installs fine, but it cannot be installed as an update over an APK built with a different key. To keep updates working, add these repository secrets under **Settings, Secrets and variables, Actions**:

| Secret | Meaning |
|--------|---------|
| `KEYSTORE_BASE64` | Base64 text of your keystore file |
| `KEYSTORE_PASSWORD` | Keystore password |
| `KEY_ALIAS` | Key alias |
| `KEY_PASSWORD` | Key password (optional, defaults to the keystore password) |

## Pin a Web2APK release (optional)

The workflow downloads the newest official Web2APK release on every run. To lock one exact release, change `WEB2APK_REF` near the top of `.github/workflows/build-apk.yml` from `'latest'` to a tag from the [Releases page](https://github.com/bhawan-kavinda/Web2APK/releases).

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `appId must look like com.company.app` | Use at least two parts separated by dots, letters and digits only, each part starting with a letter. No `-`. |
| `appName must not contain ...` | Remove `< > & " '` and `\` from the name. |
| `versionName may only contain ...` | Use only letters, digits and `. + _ -`. |
| `iconUrl did not return an image` | Use a direct link to a PNG file, not a web page. |
| APK does not install over the old one | Use the same `appId`, a bigger `versionCode`, and the same signing key. |
| App shows a blank or error page | Check that `url` starts with `https://` and the site works in your phone browser. |
| No **Run workflow** button | Enable workflows in the **Actions** tab first. |

## More help

All options and the full documentation: https://github.com/bhawan-kavinda/Web2APK

Licensed under MIT.
