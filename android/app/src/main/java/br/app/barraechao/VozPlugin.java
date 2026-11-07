package br.app.barraechao;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Voz do treinador: TTS nativo do Android com escolha do mecanismo (Samsung, Google...) e da voz.
 * O Android só deixa escolher o mecanismo ao criar o TextToSpeech, por isso setEngine recria a instância.
 */
@CapacitorPlugin(name = "Voz")
public class VozPlugin extends Plugin {

    private static final Locale PT_BR = new Locale("pt", "BR");

    private TextToSpeech tts;
    private String engine;
    private boolean ready;
    private final List<Runnable> pending = new ArrayList<>();
    private final Map<String, PluginCall> speaking = new HashMap<>();
    private int seq;

    @Override
    public void load() {
        start(null);
    }

    @Override
    protected void handleOnDestroy() {
        if (tts != null) tts.shutdown();
    }

    private synchronized void start(String pkg) {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        ready = false;
        engine = pkg;
        TextToSpeech.OnInitListener onInit = status -> {
            List<Runnable> run;
            synchronized (this) {
                ready = status == TextToSpeech.SUCCESS;
                run = new ArrayList<>(pending);
                pending.clear();
            }
            for (Runnable r : run) r.run();
        };
        tts = pkg == null || pkg.isEmpty() ? new TextToSpeech(getContext(), onInit) : new TextToSpeech(getContext(), onInit, pkg);
        tts.setOnUtteranceProgressListener(
            new UtteranceProgressListener() {
                @Override
                public void onStart(String id) {}

                @Override
                public void onDone(String id) {
                    finish(id);
                }

                @Override
                public void onError(String id) {
                    finish(id);
                }

                @Override
                public void onStop(String id, boolean interrupted) {
                    finish(id);
                }
            }
        );
    }

    private void finish(String id) {
        PluginCall call;
        synchronized (this) {
            call = speaking.remove(id);
        }
        if (call != null) call.resolve();
    }

    /** Roda quando o mecanismo terminar de iniciar (ou já, se estiver pronto). */
    private synchronized void whenReady(PluginCall call, Runnable r) {
        Runnable guarded = () -> {
            if (ready) r.run();
            else call.reject("Mecanismo de voz indisponível");
        };
        if (ready) guarded.run();
        else pending.add(guarded);
    }

    @PluginMethod
    public void getEngines(PluginCall call) {
        whenReady(call, () -> {
            JSArray list = new JSArray();
            for (TextToSpeech.EngineInfo e : tts.getEngines()) {
                JSObject o = new JSObject();
                o.put("id", e.name);
                o.put("label", e.label);
                list.put(o);
            }
            JSObject res = new JSObject();
            res.put("engines", list);
            res.put("current", engine != null ? engine : tts.getDefaultEngine());
            res.put("system", tts.getDefaultEngine());
            call.resolve(res);
        });
    }

    @PluginMethod
    public void setEngine(PluginCall call) {
        start(call.getString("engine"));
        whenReady(call, call::resolve);
    }

    @PluginMethod
    public void getVoices(PluginCall call) {
        whenReady(call, () -> {
            JSArray list = new JSArray();
            if (tts.getVoices() != null) {
                for (Voice v : tts.getVoices()) {
                    if (!"pt".equals(v.getLocale().getLanguage())) continue;
                    JSObject o = new JSObject();
                    o.put("id", v.getName());
                    o.put("lang", v.getLocale().toLanguageTag());
                    o.put("network", v.isNetworkConnectionRequired());
                    // voz que o mecanismo conhece mas ainda não baixou (o Google costuma baixar sozinho ao usar, com internet)
                    o.put("installed", v.getFeatures() == null || !v.getFeatures().contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED));
                    list.put(o);
                }
            }
            JSObject res = new JSObject();
            res.put("voices", list);
            call.resolve(res);
        });
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "");
        float rate = call.getFloat("rate", 1f);
        float pitch = call.getFloat("pitch", 1f);
        String voice = call.getString("voice");
        whenReady(call, () -> {
            tts.setLanguage(PT_BR); // volta para a voz padrão do mecanismo em pt-BR
            if (voice != null && !voice.isEmpty() && tts.getVoices() != null) {
                for (Voice v : tts.getVoices()) {
                    if (v.getName().equals(voice)) {
                        tts.setVoice(v);
                        break;
                    }
                }
            }
            tts.setSpeechRate(rate);
            tts.setPitch(pitch);
            String id;
            synchronized (this) {
                id = "voz" + (++seq);
                speaking.put(id, call);
            }
            Bundle params = new Bundle();
            params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, id);
            // QUEUE_FLUSH: a fala nova interrompe a anterior (a anterior resolve pelo onStop)
            if (tts.speak(text, TextToSpeech.QUEUE_FLUSH, params, id) != TextToSpeech.SUCCESS) finish(id);
        });
    }

    /** Abre a tela de download de vozes do mecanismo em uso; sem ela, abre as configurações de voz do Android. */
    @PluginMethod
    public void install(PluginCall call) {
        String pkg = engine != null && !engine.isEmpty() ? engine : tts != null ? tts.getDefaultEngine() : null;
        Intent i = new Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA);
        if (pkg != null) i.setPackage(pkg);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(i);
        } catch (ActivityNotFoundException e) {
            openTtsSettings();
        }
        call.resolve();
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        openTtsSettings();
        call.resolve();
    }

    private void openTtsSettings() {
        Intent s = new Intent("com.android.settings.TTS_SETTINGS");
        s.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(s);
        } catch (ActivityNotFoundException e) {
            Intent all = new Intent(Settings.ACTION_SETTINGS);
            all.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(all);
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (tts != null) tts.stop();
        call.resolve();
    }
}
