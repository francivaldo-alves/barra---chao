package br.app.barraechao;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(VozPlugin.class); // plugin local da voz do treinador (antes do super.onCreate)
        super.onCreate(savedInstanceState);
    }
}
