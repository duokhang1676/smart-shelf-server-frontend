import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  Paper,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { getSepayConfig, SepayConfig, upsertSepayConfig } from "../service/sepayConfig.service";

const defaultConfig: SepayConfig = {
  apiKey: "",
  apiSecret: "",
  merchantCode: "",
  webhookUrl: "",
  callbackUrl: "",
  sandbox: true,
  active: true,
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

  const handleToggle = (field: keyof SepayConfig) => (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setForm((prev) => ({ ...prev, [field]: checked }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        apiKey: form.apiKey,
        apiSecret: form.apiSecret,
        merchantCode: form.merchantCode,
        webhookUrl: form.webhookUrl,
        callbackUrl: form.callbackUrl,
        sandbox: form.sandbox,
        active: form.active,
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
    return !form.apiKey?.trim() || !form.apiSecret?.trim();
  }, [form.apiKey, form.apiSecret]);

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
              label="API Key"
              fullWidth
              required
              value={form.apiKey}
              onChange={handleChange("apiKey")}
            />
          </Grid>
          <Grid size={{ md: 6 , sm: 12 }}>
            <TextField
              label="API Secret"
              fullWidth
              required
              value={form.apiSecret}
              onChange={handleChange("apiSecret")}
            />
          </Grid>
          <Grid size={{ md: 6 , sm: 12 }}>
            <TextField
              label="Merchant Code"
              fullWidth
              value={form.merchantCode || ""}
              onChange={handleChange("merchantCode")}
            />
          </Grid>
          <Grid size={{ md: 6 , sm: 12 }}>
            <TextField
              label="Webhook URL"
              fullWidth
              value={form.webhookUrl || ""}
              onChange={handleChange("webhookUrl")}
            />
          </Grid>
          <Grid size={{ md: 6 , sm: 12 }}>
            <TextField
              label="Callback URL"
              fullWidth
              value={form.callbackUrl || ""}
              onChange={handleChange("callbackUrl")}
            />
          </Grid>
          <Grid size={{ md: 6 , sm: 12 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", height: "100%" }}>
              <FormControlLabel
                control={<Switch checked={!!form.sandbox} onChange={handleToggle("sandbox")} />}
                label="Sandbox"
              />
              <FormControlLabel
                control={<Switch checked={!!form.active} onChange={handleToggle("active")} />}
                label="Kích hoạt"
              />
            </Box>
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
