# Supabase database CA

`supabase-ca.crt` is public certificate material downloaded over HTTPS from the official Dashboard download URL:

https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt

The URL is defined in [Supabase's Dashboard configuration](https://github.com/supabase/supabase/blob/master/apps/studio/hooks/custom-content/custom-content.json) as `ssl:certificate_url`. Keep certificate and hostname verification enabled; update this trust anchor if Supabase rotates it. It is packaged into the private billing function, not the browser.
