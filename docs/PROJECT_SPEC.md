# CHLPS Admin Portal — Project Specification

## 1. Executive Summary & Tech Stack

The **CHLPS Admin Portal** is an enterprise dashboard for managing memberships, educational programs, courses, blog posts, events, certificates, students, payments, support queries, and administrative settings.

### Core Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with Turbopack bundler.
- **Runtime & Package Manager**: [Bun](https://bun.sh/) (`bun`, `bun.lock`).
- **UI Library & CSS**: [Tailwind CSS v4](https://tailwindcss.com/) with [daisyUI 5](https://daisyui.com/) (`flipex` custom theme).
- **TypeScript**: TypeScript 5 + [`tsgo`](https://github.com/microsoft/typescript-go) for high-performance typechecking.
- **Form Management**: `react-hook-form` + `FormProvider` with atomic form input components.
- **Notifications & Toasts**: [Sonner](https://sonner.emilkowal.ski/) through the centralized `useToast()` hook.
- **Media & File Storage**: [Cloudinary](https://cloudinary.com/) (direct REST upload + Next.js Route Handler using `cloudinary` v2 SDK + backend storage fallback).
- **Iconography**: `iconsax-react` and `lucide-react`.
- **State Management**: Redux Toolkit (session & user slice), Zustand, and Jotai.
- **Data Fetching**: Repository pattern wrapping `ApiService` (Axios) + React Query (`@tanstack/react-query`).
- **Popper / Dropdowns**: `react-popper` via custom portal.

---

## 2. Global Development Directives

1. **Package Manager & Commands**:
   - Always execute scripts using **Bun**:
     - `bun dev`: Starts the Next.js development server.
     - `bun run typecheck`: Runs `tsgo --noEmit` across all workspace files.
     - `bun run build`: Builds the production bundle with Next.js Turbopack.
     - `bun add <package>`: Installs new dependencies.

2. **Next.js 16 Dynamic Route Params**:
   - In Next.js 16 App Router, dynamic route params must be awaited in server and client components:
     ```tsx
     export default async function Page({
       params,
     }: {
       params: Promise<{ id: string }>;
     }) {
       const { id } = await params;
       return <DetailView id={id} />;
     }
     ```

3. **Notification System**:
   - Always use the Sonner-based toast hook:
     ```tsx
     import { useToast } from "@/components/ui";
     const { toast } = useToast();
     toast("Operation successful", "success"); // "success" | "danger" | "warning" | "info"
     ```

---

## 3. DaisyUI & Design System Configuration

DaisyUI 5 is configured with the `flipex` theme inside `src/app/globals.css`.

### Semantic Color Tokens

| DaisyUI Token             | Hex Value | Description                        |
| ------------------------- | --------- | ---------------------------------- |
| `--color-primary`         | `#161058` | Navy blue brand primary            |
| `--color-primary-content` | `#FFFFFF` | White text on primary              |
| `--color-secondary`       | `#717171` | Subdued gray for icons & subtitles |
| `--color-accent`          | `#FFC107` | Amber accent                       |
| `--color-base-100`        | `#F7F7F7` | Soft background                    |
| `--color-base-200`        | `#F1F1F1` | Gray interactive highlight         |
| `--color-base-300`        | `#E7E9EB` | Crisp border tone                  |
| `--color-base-content`    | `#000000` | Primary body text                  |
| `--color-success`         | `#38CB89` | Positive green / active status     |
| `--color-warning`         | `#EED202` | Yellow warning status              |
| `--color-error`           | `#E84D52` | Destructive red / danger buttons   |

---

## 4. UI Architecture & Standard Components

### 4.1. Tables (`CustomTable` & `PopUp`)

All listing screens standardize on `src/components/tables/CustomTable.tsx` and `src/components/tables/pop-up.tsx`:

- **Columns**: Array of `columnType<T>` with optional custom cell renderer (`render: (value, item) => ReactNode`).
- **Row Actions**: Array of `Actions<T>[]` with Popper 3-dot dropdown menu (`edit`, `delete`, `toggle_publish`, etc.).
- **Pagination**: Synced via `paginationProps={{ page, pageSize, setPagination }}`.
- **Row Click**: Optional `onRowClick` handler navigating to detail pages.

```tsx
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";

const columns: columnType<MyItem>[] = [
  { key: "name", label: "Name" },
  {
    key: "createdDate",
    label: "Created",
    render: (v) => formatDate(v, "DD MMM YYYY"),
  },
  {
    key: "isPublished",
    label: "Status",
    render: (val) => <StatusBadge status={val ? "published" : "draft"} />,
  },
];

const actions: Actions<MyItem>[] = [
  { key: "edit", label: "Edit", action: (item) => openEditModal(item) },
  {
    key: "delete",
    label: "Delete",
    render: () => <span className="text-error font-medium">Delete</span>,
    action: (item) => setDeleteTarget(item),
  },
];
```

### 4.2. Page Loading & Error Boundary (`PageLoader`)

Wrap all table listing views and data detail pages in `src/components/PageLoader.tsx`:

- Handles skeleton loading state when `isLoading` is true.
- Displays an inline retryable error message when `isError` is true.
- Shows empty state message when `data` is empty.

```tsx
import PageLoader from "@/components/PageLoader";

<PageLoader
  query={{
    data: items,
    isLoading: loading,
    isError,
    error,
    refetch: load,
  }}
>
  <CustomTable
    columns={columns}
    data={items}
    actions={actions}
    totalCount={count}
  />
</PageLoader>;
```

### 4.3. Modals & Confirmations (`Modal` & `ConfirmModal`)

Dialogs utilize the accessible modal components from `src/components/ui/Modal.tsx`:

- Controlled via `open: boolean` and `onClose: () => void`.
- Configurable sizes: `"sm" | "md" | "lg" | "xl" | "full"`.
- `ConfirmModal` for destructive actions (e.g. Delete, Retract, Suspend) with `variant="danger"`.

```tsx
import { Modal, ConfirmModal } from "@/components/ui";

// Standard Modal
<Modal open={open} onClose={() => setOpen(false)} title="Create Item" size="md">
  <MyForm />
</Modal>

// Destructive Confirmation Modal
<ConfirmModal
  open={!!targetItem}
  onClose={() => setTargetItem(null)}
  title="Delete Item"
  description={`Are you sure you want to delete "${targetItem?.name}"?`}
  variant="danger"
  confirmLabel="Delete"
  onConfirm={handleDelete}
/>
```

### 4.4. Image & Media Upload (`ImageUpload` & `useImageUpload`)

Image and file uploads standardize on `src/components/ui/ImageUpload.tsx` and `src/hooks/useImageUpload.ts`:

- **3-Tier Cascade**:
  1. Direct Cloudinary unsigned REST upload (`/v1_1/:cloud/image/upload`) using `NEXT_PUBLIC_CLOUDINARY_*`.
  2. Server-side Next.js route `/api/upload/cloudinary` using official `cloudinary` Node.js SDK.
  3. Backend storage fallback (`UploadRepository.upload("image", file)`).
- **Features**: Drag-and-drop file dropzone, live image preview, progress indicator, change/remove triggers, and file validation.

```tsx
import { ImageUpload } from "@/components/ui";

<ImageUpload
  label="Event Banner"
  value={watchImage}
  onChange={(url) => setValue("image", url, { shouldDirty: true })}
  folder="chlps_events"
  helperText="PNG, JPG, WEBP up to 5 MB"
/>;
```

### 4.5. Form Inputs (`src/components/inputs/`)

Forms standardize on `react-hook-form` and `<FormProvider>`:

- `SimpleInput`: Text, number, password inputs with validation state.
- `SimpleTextArea`: Multiline textarea with error feedback.
- `LocalSelect`: Local options dropdown registered with RHF.
- `SimpleSelect`: Dynamic remote select fetching from backend endpoints with search & render props.
- `DatePicker` / `MonthPicker`: Standardized date selection components.

---

## 5. Navigation & Route Hierarchy

Navigation is configured in `src/components/layout/DashboardLayout.tsx`:

| Section             | Route           | Children / Submenus                                                       | Roles            |
| ------------------- | --------------- | ------------------------------------------------------------------------- | ---------------- |
| **Dashboard**       | `/`             | —                                                                         | Admin, Sub-admin |
| **User Management** | `/admins`       | Members (`/students`), Admins (`/admins`)                                 | Admin            |
| **Membership**      | `/membership`   | All Memberships (`/membership`), Categories / Types (`/membership/types`) | Admin            |
| **Events**          | `/events`       | —                                                                         | Admin            |
| **Courses**         | `/courses`      | All Courses (`/courses`), Programs (`/programs`)                          | Admin, Sub-admin |
| **Blog**            | `/blog`         | Posts (`/blog`), Tags (`/blog-tags`)                                      | Admin            |
| **Testimonials**    | `/testimonials` | —                                                                         | Admin            |
| **FAQs**            | `/faqs`         | —                                                                         | Admin            |
| **Certificates**    | `/certificates` | All Certificates (`/certificates`), Templates (`/certificates/templates`) | Admin            |
| **Payments**        | `/payments`     | —                                                                         | Admin            |
| **Support**         | `/support`      | —                                                                         | Admin, Support   |
| **Settings**        | `/profile`      | My Profile (`/profile`), Notifications (`/notify`)                        | All              |

---

## 6. Feature Architecture & Repository Pattern

All data operations are encapsulated in `src/features/[feature]/domain/repository/`:

```
src/features/
├── membership/
│   ├── components/            # membership_modal.tsx, subscriber views
│   ├── domain/data/hooks/     # useMemberships, useMembershipDetail
│   ├── domain/data/response/  # Membership, MembershipTypeItem, payloads
│   ├── domain/repository/     # MembershipRepository (list, get, create, update, types CRUD)
│   └── pages/                 # membership_page.tsx, membership_detail_page.tsx, membership_types_page.tsx
├── courses/
│   ├── components/            # add_course_modal.tsx
│   ├── domain/data/hooks/     # useCourses
│   ├── domain/data/response/  # Course, CourseOutcome, CourseInstructor
│   ├── domain/repository/     # CoursesRepository
│   └── pages/                 # courses_page.tsx, course_detail_page.tsx
├── events/
│   ├── components/            # event_modal.tsx (RHF + ImageUpload)
│   ├── domain/data/hooks/     # useEvents
│   ├── domain/data/response/  # EventItem, payloads
│   ├── domain/repository/     # EventsRepository
│   └── pages/                 # events_page.tsx, event_detail_page.tsx
├── certificates/
│   ├── domain/repository/     # CertificatesRepository
│   └── pages/                 # certificates_page.tsx, templates_page.tsx
├── faqs/
│   ├── domain/repository/     # FaqsRepository
│   └── pages/                 # faqs_page.tsx
├── blog/
│   ├── domain/repository/     # BlogRepository
│   └── pages/                 # blog_page.tsx, blog_tags_page.tsx, add_blog_page.tsx, edit_blog_page.tsx
├── students/
│   ├── domain/repository/     # StudentsRepository
│   └── pages/                 # students_page.tsx, student_detail_page.tsx
└── uploads/
    └── domain/repository/     # UploadRepository (multi-part backend file upload)
```

### Unwrapping Response Entities

All repositories use standardized unwrap helpers from `src/lib/tokens.ts`:

- `unwrapList<T>(data)`: Safely extracts array from root or nested `{ data, items, results }`.
- `unwrapCount(data, fallback)`: Safely extracts total record count.
- `unwrapEntity<T>(data)`: Safely extracts single entity.
- `unwrapMessage(data, fallback)`: Safely extracts human-readable server message.

---

## 7. Verification Checklist for Changes

Whenever updating or creating a new feature:

1. **Typecheck**: Run `bun run typecheck` (`tsgo --noEmit`) to ensure 0 TypeScript errors.
2. **Build**: Run `bun run build` to verify Next.js Turbopack generates all static and dynamic routes.
3. **Table Standard**: Use `CustomTable` + `PageLoader` + Popper `Actions<T>[]`.
4. **Modal Standard**: Use `Modal` / `ConfirmModal` with controlled `open` and `onClose` states.
5. **Toast Standard**: Use `useToast()` from `@/components/ui` with Sonner.
6. **Upload Standard**: Use `ImageUpload` or `useImageUpload` hook for media inputs.
