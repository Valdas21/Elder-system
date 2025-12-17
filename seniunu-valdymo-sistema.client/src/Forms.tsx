import React, { useEffect, useMemo, useState } from "react";
import Api from "./axiosnew";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import AppBar from "./AppBars/ElderAppBar";
import Footer from "./Footers/Footer";
import { jwtDecode } from "jwt-decode";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useNavigate } from "react-router-dom";
import AnonymousAppBar from "./AppBars/AnonymousAppBar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";

type FormItem = {
  id?: number | string;
  adminId?: number;
  createDate?: string;
  updatedAt?: string;
  course: number | string;
  active: boolean;
  [key: string]: any;
};

function Forms() {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derive isAdmin and adminId
  const { token, role, elderCourse } = useMemo(() => {
    const t = localStorage.getItem("accessToken") || "";

    const coerceCourse = (val: unknown): number | undefined => {
      if (val == null) return undefined;
      if (typeof val === "number" && !Number.isNaN(val)) return val;
      if (typeof val === "string" && val.trim() !== "") {
        const n = Number(val);
        return Number.isFinite(n) ? n : undefined;
      }
      return undefined;
    };

    let r: string | undefined;
    let c: number | undefined;

    if (t) {
      try {
        const decoded: any = jwtDecode(t);
        r =
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
          decoded["role"];
        c = coerceCourse(
          decoded["course"] ??
            decoded["http://schemas.yourapp/claims/course"] ??
            decoded["course"]
        );
        console.log("Decoded course:", c);
      } catch {
        // Invalid token
      }
    }
    return { token: t, role: r, elderCourse: c };
  }, []);
  const isAuthenticated = !!token;
  const isAdmin = role?.toLowerCase() === "admin";
  const adminId = useMemo(() => {
    if (!token) return undefined;
    try {
      const d: any = jwtDecode(token);
      const raw =
        d["sub"] ??
        d["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
        d["nameid"] ?? d["userId"];
      const n = Number(raw);
      return Number.isFinite(n) ? n : undefined;
    } catch {
      return undefined;
    }
  }, [token]);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await Api.get<FormItem[]>("/api/Forms");

        const data = res.data;
        console.log("Fetched forms:", data);
        if (mounted) setForms(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load forms.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token, role, elderCourse]);

  const parseFormDate = (f: FormItem): Date | null => {
    const raw = f.createDate;
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  };

  const { rudensMap, pavasarioMap, rudensYears, pavasarioYears, otherForms } = useMemo(() => {
    const rMap: Record<number, FormItem[]> = {};
    const pMap: Record<number, FormItem[]> = {};
    const rYears = new Set<number>();
    const pYears = new Set<number>();
    const others: FormItem[] = [];

    for (const f of forms) {
      const d = parseFormDate(f);
      if (!d) {
        others.push(f);
        continue;
      }

      const y = d.getFullYear();
      const m = d.getMonth() + 1;

      if (m >= 9 && m <= 12) {
        (rMap[y] ||= []).push(f);
        rYears.add(y);
      } else if (m === 1) {
        (rMap[y - 1] ||= []).push(f);
        rYears.add(y - 1);
      } else if (m >= 2 && m <= 6) {
        (pMap[y] ||= []).push(f);
        pYears.add(y);
      } else {
        others.push(f);
      }
    }

    return {
      rudensMap: rMap,
      pavasarioMap: pMap,
      rudensYears: Array.from(rYears).sort((a, b) => b - a),
      pavasarioYears: Array.from(pYears).sort((a, b) => b - a),
      otherForms: others,
    };
  }, [forms]);

  const formatDate = (d?: string) => {
    const parsed = d ? new Date(d) : undefined;
    return parsed && !isNaN(parsed.getTime()) ? parsed.toLocaleDateString() : "-";
  };

  const renderSemesterTable = (
    title: string,
    years: number[],
    map: Record<number, FormItem[]>
  ) => {
    const any = years.some((y) => (map[y]?.length ?? 0) > 0);
    if (!any) return null;

    const isElder = role?.toLowerCase() === "elder";

    return (
      <Box mt={3}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <TableContainer component={Card} sx={{ width: "100%" }}>
          <Table size="small" sx={{ tableLayout: "auto", minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Course</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {years.map((y) => {
                const items = map[y] || [];
                if (items.length === 0) return null;
                return (
                  <React.Fragment key={y}>
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {y}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {items.map((f, idx) => {
                      const title = `Form #${f.id ?? idx + 1}`;
                      const rawDate = f.createDate ?? f.updatedAt;
                      const formCourse = f.course;
                      const canOpen =
                        (isAuthenticated && isAdmin) ||
                        (isAuthenticated &&
                          isElder &&
                          elderCourse != null &&
                          formCourse != null &&
                          Number(formCourse) === Number(elderCourse));

                      return (
                        <TableRow key={f.id ?? `${y}-${idx}`} hover>
                          <TableCell>{title}</TableCell>
                          <TableCell>{formatDate(rawDate)}</TableCell>
                          <TableCell>{f.active ? "Yes" : "No"}</TableCell>
                          <TableCell>{f.course ?? "-"}</TableCell>
                          <TableCell align="right">
                            <Button
                              variant="contained"
                              size="small"
                              disabled={!canOpen}
                              onClick={() => {
                                if (!canOpen) return;
                                if (isAdmin) {
                                  navigate(`/Form/${f.id}`, { state: { mode: "questionsOnly" } });
                                } else {
                                  navigate(`/Form/${f.id}`, { state: { active: f.active } });
                                }
                              }}
                            >
                              Open
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderOtherTable = (title: string, items: FormItem[]) => {
    if (!items.length) return null;
    const isElder = role?.toLowerCase() === "elder";

    return (
      <Box mt={3}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <TableContainer component={Card} sx={{ width: "100%" }}>
          <Table size="small" sx={{ tableLayout: "auto", minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Course</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((f, idx) => {
                const title = `Form #${f.id ?? idx + 1}`;
                const rawDate = f.createDate ?? f.updatedAt;
                const formCourse = f.course;
                const canOpen =
                  (isAuthenticated && isAdmin) ||
                  (isAuthenticated &&
                    isElder &&
                    elderCourse != null &&
                    formCourse != null &&
                    Number(formCourse) === Number(elderCourse));

                return (
                  <TableRow key={f.id ?? `other-${idx}`} hover>
                    <TableCell>{title}</TableCell>
                    <TableCell>{formatDate(rawDate)}</TableCell>
                    <TableCell>{f.active ? "Yes" : "No"}</TableCell>
                    <TableCell>{f.course ?? "-"}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        disabled={!canOpen}
                        onClick={() => {
                          if (!canOpen) return;
                          if (isAdmin) {
                            navigate(`/Form/${f.id}`, { state: { mode: "questionsOnly" } });
                          } else {
                            navigate(`/Form/${f.id}`, { state: { active: f.active } });
                          }
                        }}
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // Create form dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createCourse, setCreateCourse] = useState<number | ''>('');
  const [createActive, setCreateActive] = useState<boolean>(true);
  const [createDate, setCreateDate] = useState<string>(() => new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
  const [questions, setQuestions] = useState<Array<{ id: number; text?: string }>>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const openCreate = async () => {
    setCreateError(null);
    setSelectedQuestionIds([]);
    setCreateCourse('');
    setCreateActive(true);
    setCreateDate(new Date().toISOString().slice(0, 10));
    setCreateOpen(true);
    try {
      const res = await Api.get<Array<{ id: number; text?: string }>>("/api/Questions");
      setQuestions(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setCreateError(e?.message || "Failed to load questions.");
    }
  };

  const toggleQuestion = (qid: number) => {
    setSelectedQuestionIds(prev =>
      prev.includes(qid) ? prev.filter(id => id !== qid) : [...prev, qid]
    );
  };

  const handleCreateSubmit = async () => {
    if (!isAdmin || !adminId) {
      setCreateError("Missing admin id.");
      return;
    }
    const courseNum = typeof createCourse === "string" ? Number(createCourse) : createCourse;
    if (!Number.isFinite(courseNum)) {
      setCreateError("Course must be a number.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const payload = {
        FkAdminId: adminId,
        Course: Number(courseNum),
        Active: createActive,
        CreateDate: new Date(createDate).toISOString(),
        QuestionIds: selectedQuestionIds,
      };
      const res = await Api.post<FormItem>("/api/Forms", payload);
      const created = res.data;
      setForms(prev => [created, ...prev]);
      setCreateOpen(false);
    } catch (e: any) {
      setCreateError(e?.response?.data?.message || e?.message || "Failed to create form.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {isAuthenticated ? <AppBar /> : <AnonymousAppBar />}
      <Container maxWidth="xl" sx={{ mt: 12, mb: 6 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" fontWeight="bold">Forms</Typography>
          <Box display="flex" gap={1} alignItems="center">
            {isAdmin && (
              <Button variant="contained" onClick={openCreate}>
                Create form
              </Button>
            )}
            <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
          </Box>
        </Box>
        {!isAuthenticated && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You can browse forms, but you must log in to open them.
          </Alert>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <>
            {forms.length === 0 && <Alert severity="info">No forms available.</Alert>}

            {renderSemesterTable("Rudens semestras", rudensYears, rudensMap)}
            {renderSemesterTable("Pavasario semestras", pavasarioYears, pavasarioMap)}
            {renderOtherTable("Kiti mėnesiai (Liepa–Rugpjūtis arba be datos)", otherForms)}
          </>
        )}
      </Container>

      {/* Create Form Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Create form</DialogTitle>
        <DialogContent dividers>
          {createError && <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>}
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={2} mb={2}>
            <TextField
              label="Course"
              type="number"
              value={createCourse}
              onChange={(e) => setCreateCourse(e.target.value === "" ? "" : Number(e.target.value))}
              fullWidth
            />
            <TextField
              label="Create date"
              type="date"
              value={createDate}
              onChange={(e) => setCreateDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={createActive}
                  onChange={(e) => setCreateActive(e.target.checked)}
                />
              }
              label="Active"
            />
          </Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Select questions
          </Typography>
          <Card variant="outlined">
            <List dense sx={{ maxHeight: 300, overflow: "auto" }}>
              {questions.map((q) => (
                <ListItem key={q.id} disablePadding>
                  <ListItemButton onClick={() => toggleQuestion(q.id)}>
                    <ListItemText primary={`#${q.id}`} secondary={q.text ?? ""} />
                  </ListItemButton>
                  <ListItemSecondaryAction>
                    <Checkbox
                      edge="end"
                      checked={selectedQuestionIds.includes(q.id)}
                      onChange={() => toggleQuestion(q.id)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSubmit} disabled={creating}>
            {creating ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
}

export default Forms;
