# Manual Content Model Setup Guide for Login and Get Started Pages

This guide provides step-by-step instructions for manually creating the Login Page and Get Started Page content models in Contentstack UI, ensuring each field is properly mapped to the website design.

---

## Prerequisites

1. Log in to your Contentstack account
2. Select your Stack
3. Navigate to **Content Types** in the left sidebar

---

## PART 1: Creating the Login Page Content Model

### Step 1: Create New Content Type

1. Click **"+ New Content Type"** button
2. Select **"Start Fresh"**
3. In the **"Content Type Name"** field, enter: `Login Page`
4. In the **"API Identifier (UID)"** field, enter: `login`
5. Click **"Create"**

### Step 2: Add Hero Section Group

1. Click **"+ Add Field"**
2. Select **"Group"** field type
3. Configure the field:
   - **Display Name**: `Hero Section`
   - **Field UID**: `hero` (auto-filled, but verify)
   - **Multiple**: ❌ No (unchecked)
   - **Required**: ❌ No (unchecked)
4. Click **"Save Field"**
5. **Inside the Hero Section group**, add the following fields:

   **a) Eyebrow Text:**
   - Click **"+ Add Field"** inside the group
   - Select **"Single Line Textbox"**
   - Display Name: `Eyebrow Text`
   - Field UID: `eyebrow`
   - Multiple: ❌ No
   - Required: ❌ No
   - Click **"Save Field"**

   **b) Heading:**
   - Click **"+ Add Field"**
   - Select **"Single Line Textbox"**
   - Display Name: `Heading`
   - Field UID: `heading`
   - Multiple: ❌ No
   - Required: ❌ No
   - Click **"Save Field"**

   **c) Subheading:**
   - Click **"+ Add Field"**
   - Select **"Single Line Textbox"**
   - Display Name: `Subheading`
   - Field UID: `subheading`
   - Multiple: ❌ No
   - Required: ❌ No
   - Click **"Save Field"**

6. Click **"Back"** to exit the Hero Section group

### Step 3: Add Form Group

1. Click **"+ Add Field"**
2. Select **"Group"** field type
3. Configure:
   - **Display Name**: `Form`
   - **Field UID**: `form`
   - **Multiple**: ❌ No
   - **Required**: ❌ No
4. Click **"Save Field"**
5. **Inside the Form group**, add these fields in order:

   **a) Title:**
   - Type: **Single Line Textbox**
   - Display Name: `Title`
   - Field UID: `title`

   **b) Subtitle:**
   - Type: **Single Line Textbox**
   - Display Name: `Subtitle`
   - Field UID: `subtitle`

   **c) Email Label:**
   - Type: **Single Line Textbox**
   - Display Name: `Email Label`
   - Field UID: `email_label`

   **d) Password Label:**
   - Type: **Single Line Textbox**
   - Display Name: `Password Label`
   - Field UID: `password_label`

   **e) Remember Me Text:**
   - Type: **Single Line Textbox**
   - Display Name: `Remember Me Text`
   - Field UID: `remember_me_text`

   **f) Forgot Password Text:**
   - Type: **Single Line Textbox**
   - Display Name: `Forgot Password Text`
   - Field UID: `forgot_password_text`

   **g) Submit Text:**
   - Type: **Single Line Textbox**
   - Display Name: `Submit Text`
   - Field UID: `submit_text`

   **h) Or Text:**
   - Type: **Single Line Textbox**
   - Display Name: `Or Text`
   - Field UID: `or_text`

   **i) Social Login Text:**
   - Type: **Single Line Textbox**
   - Display Name: `Social Login Text`
   - Field UID: `social_login_text`

6. Click **"Back"** to exit the Form group

### Step 4: Add Features Group (Multiple)

1. Click **"+ Add Field"**
2. Select **"Group"** field type
3. Configure:
   - **Display Name**: `Features`
   - **Field UID**: `features`
   - **Multiple**: ✅ **YES** (checked - this allows multiple feature items)
   - **Required**: ❌ No
4. Click **"Save Field"**
5. **Inside the Features group**, add:

   **a) Title:**
   - Type: **Single Line Textbox**
   - Display Name: `Title`
   - Field UID: `title`

   **b) Description:**
   - Type: **Single Line Textbox**
   - Display Name: `Description`
   - Field UID: `description`

   **c) Icon:**
   - Type: **Single Line Textbox**
   - Display Name: `Icon`
   - Field UID: `icon`

6. Click **"Back"** to exit the Features group

### Step 5: Add Footer Group

1. Click **"+ Add Field"**
2. Select **"Group"** field type
3. Configure:
   - **Display Name**: `Footer`
   - **Field UID**: `footer`
   - **Multiple**: ❌ No
   - **Required**: ❌ No
4. Click **"Save Field"**
5. **Inside the Footer group**, add:

   **a) Link Groups (Multiple):**
   - Click **"+ Add Field"**
   - Select **"Group"** field type
   - Display Name: `Link Groups`
   - Field UID: `link_groups`
   - **Multiple**: ✅ **YES** (checked)
   - Required: ❌ No
   - Click **"Save Field"**
   
   **Inside Link Groups**, add:
   
   - **Title:**
     - Type: **Single Line Textbox**
     - Display Name: `Title`
     - Field UID: `title`
   
   - **Links:**
     - Type: **Link**
     - Display Name: `Links`
     - Field UID: `links`
     - **Multiple**: ✅ **YES** (checked)
     - Required: ❌ No

6. Click **"Back"** twice to exit Footer and Link Groups

### Step 6: Save Content Type

1. Click **"Save"** at the top right
2. Verify all fields are in the correct order:
   - Hero Section (group)
   - Form (group)
   - Features (group, multiple)
   - Footer (group)

---

## PART 2: Creating the Get Started Page Content Model

### Step 1: Create New Content Type

1. Click **"+ New Content Type"**
2. Select **"Start Fresh"**
3. Content Type Name: `Get Started Page`
4. API Identifier (UID): `get_started`
5. Click **"Create"**

### Step 2: Add Hero Section Group

1. Click **"+ Add Field"**
2. Select **"Group"**
3. Configure:
   - Display Name: `Hero Section`
   - Field UID: `hero`
   - Multiple: ❌ No
   - Required: ❌ No
4. Click **"Save Field"**
5. **Inside Hero Section**, add:

   - **Eyebrow Text** (Single Line Textbox, UID: `eyebrow`)
   - **Heading** (Single Line Textbox, UID: `heading`)
   - **Subheading** (Single Line Textbox, UID: `subheading`)

6. Click **"Back"**

### Step 3: Add Steps Group (Multiple)

1. Click **"+ Add Field"**
2. Select **"Group"**
3. Configure:
   - Display Name: `Steps`
   - Field UID: `steps`
   - **Multiple**: ✅ **YES** (checked)
   - Required: ❌ No
4. Click **"Save Field"**
5. **Inside Steps**, add:

   - **Number** (Number, UID: `number`)
   - **Title** (Single Line Textbox, UID: `title`)
   - **Description** (Single Line Textbox, UID: `description`)
   - **Icon** (Single Line Textbox, UID: `icon`)

6. Click **"Back"**

### Step 4: Add Form Group

1. Click **"+ Add Field"**
2. Select **"Group"**
3. Configure:
   - Display Name: `Form`
   - Field UID: `form`
   - Multiple: ❌ No
   - Required: ❌ No
4. Click **"Save Field"**
5. **Inside Form**, add:

   - **Title** (Single Line Textbox, UID: `title`)
   - **Subtitle** (Single Line Textbox, UID: `subtitle`)
   - **Name Label** (Single Line Textbox, UID: `name_label`)
   - **Email Label** (Single Line Textbox, UID: `email_label`)
   - **Company Label** (Single Line Textbox, UID: `company_label`)
   - **Submit Text** (Single Line Textbox, UID: `submit_text`)
   - **Terms Text** (Single Line Textbox, UID: `terms_text`)

6. Click **"Back"**

### Step 5: Add Benefits Group (Multiple)

1. Click **"+ Add Field"**
2. Select **"Group"**
3. Configure:
   - Display Name: `Benefits`
   - Field UID: `benefits`
   - **Multiple**: ✅ **YES** (checked)
   - Required: ❌ No
4. Click **"Save Field"**
5. **Inside Benefits**, add:

   - **Title** (Single Line Textbox, UID: `title`)
   - **Description** (Single Line Textbox, UID: `description`)
   - **Icon** (Single Line Textbox, UID: `icon`)

6. Click **"Back"**

### Step 6: Add Footer Group

1. Click **"+ Add Field"**
2. Select **"Group"**
3. Configure:
   - Display Name: `Footer`
   - Field UID: `footer`
   - Multiple: ❌ No
   - Required: ❌ No
4. Click **"Save Field"**
5. **Inside Footer**, add:

   - **Link Groups** (Group, UID: `link_groups`, **Multiple: YES**)
   
   **Inside Link Groups**, add:
   
   - **Title** (Single Line Textbox, UID: `title`)
   - **Links** (Link, UID: `links`, **Multiple: YES**)

6. Click **"Back"** twice

### Step 7: Save Content Type

1. Click **"Save"**
2. Verify field order:
   - Hero Section
   - Steps (multiple)
   - Form
   - Benefits (multiple)
   - Footer

---

## PART 3: Creating Entries

### Creating Login Page Entry

1. Go to **Entries** → **Login Page**
2. Click **"+ Create New Entry"**
3. **Title Field** (at the top): Enter `Login Page` or your preferred title
   - ⚠️ **IMPORTANT**: This is the entry's system title field (not a custom field)
   - This will appear in entry listings and is used for identification
4. Fill in the Hero Section:
   - Eyebrow Text: e.g., `🔐 Secure Access`
   - Heading: e.g., `Welcome Back`
   - Subheading: e.g., `Sign in to your account...`
5. Fill in the Form fields:
   - Title: `Sign In`
   - Subtitle: `Enter your credentials to continue`
   - Email Label: `Email Address`
   - Password Label: `Password`
   - Remember Me Text: `Remember me`
   - Forgot Password Text: `Forgot password?`
   - Submit Text: `Sign In`
   - Or Text: `Or continue with`
   - Social Login Text: `Social Login`
6. Add Features (click **"+ Add Item"** for each):
   - Feature 1: Title: `Enterprise-grade security`, Description: `Your data is protected...`
   - Feature 2: Title: `24/7 Support`, Description: `Get help whenever...`
   - Feature 3: Title: `Scalable Platform`, Description: `Grows with your business`
7. Fill in Footer → Link Groups:
   - Add link groups as needed
8. Click **"Save"**
9. Click **"Publish"** to make it live

### Creating Get Started Page Entry

1. Go to **Entries** → **Get Started Page**
2. Click **"+ Create New Entry"**
3. **Title Field**: Enter `Get Started Page`
4. Fill in Hero Section:
   - Eyebrow Text: e.g., `🚀 Start Your Journey`
   - Heading: e.g., `Get Started Today`
   - Subheading: e.g., `Join thousands of companies...`
5. Add Steps (click **"+ Add Item"**):
   - Step 1: Number: `1`, Title: `Create Your Account`, Description: `Sign up with your email...`
   - Step 2: Number: `2`, Title: `Set Up Your Stack`, Description: `Configure your content model...`
   - Step 3: Number: `3`, Title: `Start Creating`, Description: `Begin managing your content...`
6. Fill in Form:
   - Title: `Create Your Account`
   - Subtitle: `Fill in your details to get started`
   - Name Label: `Full Name`
   - Email Label: `Email Address`
   - Company Label: `Company Name`
   - Submit Text: `Get Started Free`
   - Terms Text: `I agree to the Terms of Service and Privacy Policy`
7. Add Benefits:
   - Benefit 1: Title: `14-day free trial`, Description: `Full access to all features`
   - Benefit 2: Title: `No credit card required`, Description: `Start risk-free`
   - Benefit 3: Title: `Expert support`, Description: `Get help when you need it`
8. Fill in Footer
9. Click **"Save"**
10. Click **"Publish"**

---

## PART 4: Setting Up Live Preview

### For Login Page

1. Go to **Content Types** → **Login Page**
2. Click the **"..."** menu → **"Settings"** or **"Manage"**
3. Navigate to **"Live Preview"** section
4. Click **"Configure"** or **"+ Add URL"**
5. Enter the Live Preview URL:
   ```
   http://localhost:5173/login?content_type_uid=login&entry_uid={entry_uid}
   ```
   - Replace `5173` with your development server port if different
   - The `{entry_uid}` placeholder will be automatically replaced by Contentstack
6. Click **"Save"**

### For Get Started Page

1. Go to **Content Types** → **Get Started Page**
2. Navigate to **"Live Preview"** settings
3. Add URL:
   ```
   http://localhost:5173/get-started?content_type_uid=get_started&entry_uid={entry_uid}
   ```
4. Click **"Save"**

### Testing Live Preview

1. Open an entry in Contentstack
2. Click **"Live Preview"** button (usually in the top right)
3. The page should open in an iframe showing your website
4. You should see **edit buttons** (pencil icons) on editable fields
5. Click any edit button to edit the field directly
6. Changes should appear instantly on the preview

---

## Field Mapping Reference

### Login Page Field Mapping

| Contentstack Field | Website Location | Component |
|-------------------|------------------|-----------|
| `hero.eyebrow` | Hero section eyebrow badge | LoginPage.jsx line 266 |
| `hero.heading` | Main heading (h1) | LoginPage.jsx line 273 |
| `hero.subheading` | Subheading paragraph | LoginPage.jsx line 280 |
| `form.title` | Form title | LoginPage.jsx line 321 |
| `form.subtitle` | Form subtitle | LoginPage.jsx line 327 |
| `form.email_label` | Email input label | LoginPage.jsx line 338 |
| `form.password_label` | Password input label | LoginPage.jsx line 359 |
| `form.remember_me_text` | Remember me checkbox text | LoginPage.jsx line 394 |
| `form.forgot_password_text` | Forgot password link | LoginPage.jsx line 402 |
| `form.submit_text` | Submit button text | LoginPage.jsx line 414 |
| `form.or_text` | Divider text | LoginPage.jsx line 428 |
| `features[].title` | Feature item title | LoginPage.jsx line 303 |
| `features[].description` | Feature item description | LoginPage.jsx line 304 |
| `footer.link_groups[].title` | Footer link group title | Footer component |
| `footer.link_groups[].links[]` | Footer links | Footer component |

### Get Started Page Field Mapping

| Contentstack Field | Website Location | Component |
|-------------------|------------------|-----------|
| `hero.eyebrow` | Hero eyebrow badge | GetStartedPage.jsx line 265 |
| `hero.heading` | Main heading (h1) | GetStartedPage.jsx line 272 |
| `hero.subheading` | Subheading | GetStartedPage.jsx line 279 |
| `steps[].number` | Step number badge | GetStartedPage.jsx line 305 |
| `steps[].title` | Step title | GetStartedPage.jsx line 308 |
| `steps[].description` | Step description | GetStartedPage.jsx line 309 |
| `form.title` | Form title | GetStartedPage.jsx line 355 |
| `form.subtitle` | Form subtitle | GetStartedPage.jsx line 361 |
| `form.name_label` | Name input label | GetStartedPage.jsx line 372 |
| `form.email_label` | Email input label | GetStartedPage.jsx line 393 |
| `form.company_label` | Company input label | GetStartedPage.jsx line 414 |
| `form.submit_text` | Submit button text | GetStartedPage.jsx line 451 |
| `form.terms_text` | Terms checkbox text | GetStartedPage.jsx line 439 |
| `benefits[].title` | Benefit title | GetStartedPage.jsx line 336 |
| `benefits[].description` | Benefit description | GetStartedPage.jsx line 337 |
| `footer.link_groups[]` | Footer links | Footer component |

---

## Troubleshooting

### Title Field Not Showing

The **Title** field in Contentstack is the entry's system title (displayed at the top when editing an entry). It's automatically available as `entry.title` in the code. If you need to use it in your component:

```javascript
{entry?.title || cmsData?.title || 'Default Title'}
```

### Edit Buttons Not Appearing in Live Preview

1. **Check Live Preview URL**: Ensure the URL matches your development server port
2. **Check Environment Variables**: Verify `VITE_CONTENTSTACK_LIVE_PREVIEW=true` in your `.env`
3. **Check Preview Token**: Ensure `VITE_CONTENTSTACK_PREVIEW_TOKEN` is set correctly
4. **Browser Console**: Check for JavaScript errors in the browser console
5. **Contentstack Settings**: Verify Live Preview is enabled for the content type

### Fields Not Updating on Website

1. **Publish Status**: Ensure the entry is **Published** (not just saved)
2. **Environment Match**: Check that `.env` file has the correct `VITE_CONTENTSTACK_ENVIRONMENT`
3. **Browser Cache**: Hard refresh (`Ctrl+Shift+R` or `Cmd+Shift+R`)
4. **API Keys**: Verify all Contentstack API keys are correct in `.env`

### Multiple Groups Not Working

- Ensure the **"Multiple"** checkbox is **checked** for:
  - Features (Login Page)
  - Steps (Get Started Page)
  - Benefits (Get Started Page)
  - Link Groups (both pages)

---

## Summary Checklist

### Login Page Content Model
- [ ] Content Type created with UID: `login`
- [ ] Hero Section group added with eyebrow, heading, subheading
- [ ] Form group added with all 9 fields
- [ ] Features group added (Multiple: YES) with title, description, icon
- [ ] Footer group added with Link Groups (Multiple: YES)
- [ ] Entry created and published
- [ ] Live Preview URL configured

### Get Started Page Content Model
- [ ] Content Type created with UID: `get_started`
- [ ] Hero Section group added
- [ ] Steps group added (Multiple: YES) with number, title, description, icon
- [ ] Form group added with all 7 fields
- [ ] Benefits group added (Multiple: YES) with title, description, icon
- [ ] Footer group added
- [ ] Entry created and published
- [ ] Live Preview URL configured

### Live Preview Setup
- [ ] `VITE_CONTENTSTACK_LIVE_PREVIEW=true` in `.env`
- [ ] `VITE_CONTENTSTACK_PREVIEW_TOKEN` set in `.env`
- [ ] Live Preview URLs added to both content types
- [ ] Edit buttons appear when viewing entries in Live Preview
- [ ] Changes reflect immediately in preview

---

**Note**: The entry **Title** field (system field) is automatically available in your code via `entry.title`. You don't need to create a custom title field unless you want a separate title for display on the website (different from the entry's administrative title).

