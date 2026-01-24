import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { getSepayConfig, SepayConfig, upsertSepayConfig } from "../service/sepayConfig.service";

const defaultConfig: SepayConfig = {
  VIETQR_ACCOUNT_NO: "",
  VIETQR_ACCOUNT_NAME: "",
  VIETQR_ACQ_ID: "",
  SEPAY_AUTH_TOKEN: "",
  SEPAY_BANK_ACCOUNT_ID: "",
};

const ConfigPage: React.FC = () => {
  const [form, setForm] = useState<SepayConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>(
    { open: false, message: "", severity: "success" }
  );

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const config = await getSepayConfig(controller.signal);
        setForm(config || defaultConfig);
      } catch (err: any) {
        console.error("Failed to load Sepay config", err);
        setSnackbar({ open: true, message: "Không tải được cấu hình", severity: "error" });
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const handleChange = (field: keyof SepayConfig) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        VIETQR_ACCOUNT_NO: form.VIETQR_ACCOUNT_NO,
        VIETQR_ACCOUNT_NAME: form.VIETQR_ACCOUNT_NAME,
        VIETQR_ACQ_ID: form.VIETQR_ACQ_ID,
        SEPAY_AUTH_TOKEN: form.SEPAY_AUTH_TOKEN,
        SEPAY_BANK_ACCOUNT_ID: form.SEPAY_BANK_ACCOUNT_ID,
      };
      const saved = await upsertSepayConfig(payload);
      setForm(saved);
      setSnackbar({ open: true, message: "Đã lưu cấu hình Sepay", severity: "success" });
    } catch (err: any) {
      console.error("Failed to save Sepay config", err);
      const message = err?.response?.data?.error || "Lưu thất bại";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const isDisabled = useMemo(() => {
    return !form.VIETQR_ACCOUNT_NO?.trim() || !form.VIETQR_ACCOUNT_NAME?.trim() || !form.VIETQR_ACQ_ID?.trim() || !form.SEPAY_AUTH_TOKEN?.trim() || !form.SEPAY_BANK_ACCOUNT_ID?.trim();
  }, [form.VIETQR_ACCOUNT_NO, form.VIETQR_ACCOUNT_NAME, form.VIETQR_ACQ_ID, form.SEPAY_AUTH_TOKEN, form.SEPAY_BANK_ACCOUNT_ID]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <SettingsIcon />
          <Typography variant="h6">Cấu hình tài khoản Sepay</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ md: 6 , sm: 12 }}>
            <TextField
              label="Số tài khoản"
              fullWidth
              required
              value={form.VIETQR_ACCOUNT_NO}
              onChange={handleChange("VIETQR_ACCOUNT_NO")}
            />
          </Grid>
          <Grid size={{ md: 6 , sm: 12 }}>
            <TextField
              label="Tên chủ tài khoản"
              fullWidth
              required
              value={form.VIETQR_ACCOUNT_NAME}
              onChange={handleChange("VIETQR_ACCOUNT_NAME")}
            />
          </Grid>
          <Grid size={{ md: 6 , sm: 12 }}>
            <TextField
              label="Đầu số thẻ của ngân hàng"
              fullWidth
              required
              value={form.VIETQR_ACQ_ID}
              onChange={handleChange("VIETQR_ACQ_ID")}
            />
          </Grid>
          <Grid size={{ md: 6 , sm: 12 }}>
            <TextField
              label="API Token"
              fullWidth
              required
              value={form.SEPAY_AUTH_TOKEN}
              onChange={handleChange("SEPAY_AUTH_TOKEN")}
            />
          </Grid>
          <Grid size={{ md: 12 }}>
            <TextField
              label="ID Token"
              fullWidth
              required
              value={form.SEPAY_BANK_ACCOUNT_ID}
              onChange={handleChange("SEPAY_BANK_ACCOUNT_ID")}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
            onClick={handleSubmit}
            disabled={saving || isDisabled}
          >
            {saving ? "Đang lưu..." : "Lưu cấu hình"}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConfigPage;
