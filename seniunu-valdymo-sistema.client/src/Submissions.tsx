import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Api from "./axiosnew";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import ElderAppBar from "./AppBars/ElderAppBar";
import Footer from "./Footers/Footer";
import { jwtDecode } from "jwt-decode";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";

type Submission = {
  id?: number;
  Id?: number;
  fkFormId?: number;
  FkFormId?: number;
  formTitle?: string;
  FormTitle?: string;
  fillDate?: string;
  SubmittedAt?: string;
  responses?: Array<{ text?: string; Text?: string }>;

};

type Form = {
  id?: number;
  Id?: number;
  course?: string;
  Course?: string;
  title?: string;
  Title?: string;
  name?: string;
  Name?: string;
};

function Submissions() {
  const navigate = useNavigate();

  const token = useMemo(() => localStorage.getItem("jwtToken") || "", []);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Derive role and elderId from token
  const { role, elderId } = useMemo(() => {
    if (!token) return { role: undefined, elderId: undefined as number | undefined };
    try {
      const d: any = jwtDecode(token);
      const r = (d["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? d["role"]) as string | undefined;
      const rawId =
        d["sub"] ??
        d["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
        d["nameid"] ??
        d["userId"];
      const n = Number(rawId);
      return { role: r, elderId: Number.isFinite(n) ? n : undefined };
    } catch {
      return { role: undefined, elderId: undefined };
    }
  }, [token]);

  const isAdmin = role?.toLowerCase() === "admin";

  const getId = (s: Submission) => s.id ?? s.Id;
  const getFormId = (s: Submission) => s.fkFormId ?? s.FkFormId;
  const getFormTitle = (s: Submission) => s.formTitle ?? s.FormTitle ?? `Form ${getFormId(s) ?? ""}`;
  const getSubmittedAt = (s: Submission) => s.fillDate;
  const getResponseCount = (s: Submission) => (Array.isArray(s.responses) ? s.responses.length : 0);

  // Cache for fetched forms
  const [formsById, setFormsById] = useState<Record<number, Form>>({});
  const getCourse = (fid?: number) => {
    if (!fid) return undefined;
    const f = formsById[fid];
    return f?.course ?? f?.Course ?? f?.title ?? f?.Title ?? f?.name ?? f?.Name;
  };

  // Group submissions by form
  const grouped = useMemo(() => {
    const map = new Map<number | string, { title: string; items: Submission[] }>();
    for (const s of submissions) {
      const fid = getFormId(s) ?? "unknown";
      const title = getFormTitle(s);
      const entry = map.get(fid);
      if (entry) {
        entry.items.push(s);
      } else {
        map.set(fid, { title, items: [s] });
      }
    }
    // Convert to array and sort by title
    return Array.from(map.entries())
      .map(([formId, { title, items }]) => ({ formId, title, items }))
      .sort((a, b) => String(a.title).localeCompare(String(b.title)));
  }, [submissions]);

  // Add: view and delete handlers
  const handleView = (s: Submission) => {
    const Id = getId(s);
    if (!Id) return;
    // Navigate to form; if you have a dedicated submission details route, adjust here.
    navigate(`/Submissions/${Id}/Responses`);
  };

  const handleDelete = async (s: Submission) => {
    // Block admin from deleting
    if (isAdmin) return;
    const submissionId = getId(s);
    if (!submissionId) return;
    const ok = window.confirm("Delete this submission? This cannot be undone.");
    if (!ok) return;

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      // Adjust endpoint if your API uses a different pattern
      await Api.delete(`/api/Submissions/${submissionId}`, { headers });
      // Optimistically update UI
      setSubmissions(prev => prev.filter(x => getId(x) !== submissionId));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to delete submission.");
    }
  };

  // Add: navigate to edit mode
  const handleEdit = (s: Submission) => {
    // Block admin from editing
    if (isAdmin) return;
    const Id = getId(s);
    if (!Id) return;
    navigate(`/Submissions/${Id}/Responses`, { state: { edit: true } });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        let res;
        if (isAdmin) {
          // Admin: fetch all submissions
          res = await Api.get<Submission[]>(`/api/Submissions`, { headers });
          console.log("Fetched submissions for admin:", res.data);
        } else {
          // Elder: require elderId and fetch own submissions
          if (!elderId) {
            setError("Missing elder id.");
            setLoading(false);
            return;
          }
          res = await Api.get<Submission[]>(`/api/Submissions/ByElder`, {
            params: { elderId },
            headers,
          });
        }

        if (mounted) setSubmissions(Array.isArray(res.data) ? res.data : []);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load submissions.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [elderId, token, isAdmin]);

  // Add: fetch forms by id after submissions load
  useEffect(() => {
    // After submissions load, fetch missing forms by id
    const uniqueIds = Array.from(
      new Set(
        submissions
          .map(getFormId)
          .filter((x): x is number => typeof x === "number" && Number.isFinite(x))
      )
    );
    const missing = uniqueIds.filter(fid => !(fid in formsById));
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const results = await Promise.allSettled(
          missing.map(fid => Api.get<Form>(`/api/Forms/${fid}`, { headers }))
        );
        if (cancelled) return;
        const next: Record<number, Form> = {};
        results.forEach((res, idx) => {
          const fid = missing[idx];
          if (res.status === "fulfilled" && res.value?.data) {
            next[fid] = res.value.data;
          }
        });
        if (Object.keys(next).length > 0) {
          setFormsById(prev => ({ ...prev, ...next }));
        }
      } catch {
        // swallow; course is optional UI info
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [submissions, token, formsById]);

  return (
    <>
      <ElderAppBar />
      {/* Spacer so content starts below fixed AppBar */}
      <Toolbar />

      <Container maxWidth="xl" sx={{ mb: 6 }}>
        {/* Page header */}
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {isAdmin ? "All submissions" : "My submissions"}
            </Typography>
            {!isAdmin && (
              <Typography variant="body2" color="text.secondary">
                Elder ID: {elderId ?? "Unknown"}
              </Typography>
            )}
          </Box>
          <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <>
            {submissions.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Stack alignItems="center" spacing={1}>
                  <Alert severity="info" sx={{ width: "100%" }}>
                    {isAdmin ? "No submissions found." : "You haven’t submitted any forms yet."}
                  </Alert>
                  <Button variant="contained" onClick={() => navigate("/Forms")}>
                    Go to Forms
                  </Button>
                </Stack>
              </Paper>
            ) : (
              <Stack spacing={3}>
                {grouped.map(group => {
                  const fid = typeof group.formId === "number" ? group.formId : Number(group.formId);
                  const course = Number.isFinite(fid) ? getCourse(fid as number) : undefined;

                  return (
                    <Paper key={String(group.formId)} variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                      {/* Group header */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
                        <Stack spacing={0.5}>
                          <Typography variant="h5" fontWeight="bold">
                            {group.title}
                          </Typography>
                          {course && (
                            <Typography variant="body2" color="text.secondary">
                              Course: {course}
                            </Typography>
                          )}
                        </Stack>
                        <Chip
                          label={`Total: ${group.items.length}`}
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>

                      {/* Submissions grid */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" },
                          gap: 2,
                        }}
                      >
                        {group.items.map((s) => {
                          const sid = String(getId(s) ?? `${getFormId(s)}-${getSubmittedAt(s)}`);
                          const submittedAt = getSubmittedAt(s) || "Unknown";
                          const responses = getResponseCount(s);

                          return (
                            <Card key={sid} sx={{ borderRadius: 2 }}>
                              <CardContent>
                                <Stack spacing={1}>
                                  <Typography variant="subtitle2" fontWeight={700}>
                                    Submission {sid}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Submitted at: {submittedAt}
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={`Responses: ${responses}`}
                                    variant="outlined"
                                    sx={{ width: "fit-content" }}
                                  />
                                </Stack>

                                {/* Actions */}
                                <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                                  <Button size="small" variant="outlined" onClick={() => handleView(s)}>
                                    View
                                  </Button>
                                  {!isAdmin && (
                                    <>
                                      <Button size="small" variant="outlined" onClick={() => handleEdit(s)}>
                                        Edit
                                      </Button>
                                      <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(s)}>
                                        Delete
                                      </Button>
                                    </>
                                  )}
                                </Stack>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </>
        )}
      </Container>
      <Footer />
    </>
  );
}

export default Submissions;